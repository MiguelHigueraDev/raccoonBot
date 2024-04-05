import { Command } from '@sapphire/framework'
import { type User, type ChatInputCommandInteraction, type Message } from 'discord.js'
import Alerts from '../../../lib/alerts/alerts'
import { addMinutes, getUnixTime } from 'date-fns'
import invitesManager from '../../../lib/games/invitesManager'
import { type InviteData } from '../../../lib/interface/gameInvite'

const MAX_DAMAGE = 5

export class HangmanCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'hangman',
      description: 'Play hangman with another player.',
      cooldownDelay: 15000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDMPermission(false)
        .addUserOption((option) =>
          option
            .setName('player')
            .setDescription('The player you want to play with.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('word')
            .setDescription('The word you want to them to guess.')
            .setRequired(true)
            .setMaxLength(15)
            .setMinLength(3)
        )
    , {
      idHints: ['1206068859354873896']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // At least 3 letters + spaces
    const onlyLettersRegex = /^(?:[a-zA-Z]\s*){3,}$/
    const input = interaction.options.getString('word', true)

    // Basic checks
    if (!onlyLettersRegex.test(input)) {
      return await Alerts.WARN(interaction, 'You can only enter letters (a-z) and spaces for the word.', true)
    }
    const invited = interaction.options.getUser('player', true)
    if (invited.id === interaction.user.id) return await Alerts.WARN(interaction, 'You cannot play hangman with yourself!\n\nInvite another player!', true)
    if (invited.bot) return await Alerts.WARN(interaction, 'You can\'t play hangman with a bot!\n\nInvite a human player!', true)

    // Send invite to player
    const word = input.toLowerCase()
    const twoMinutesInTheFuture = getUnixTime(addMinutes(Date.now(), 2))
    const inviteData: InviteData = { inviter: interaction.user, invited, timestamp: twoMinutesInTheFuture, game: 'Hangman' }
    const invite = invitesManager.makeInvite(inviteData)
    if (interaction.channel == null) return

    // Send a message to the player so interaction is acknowledged. Delete it immediately.
    const preMessage = await interaction.reply({ content: 'Sending invite...' })
    await preMessage.delete()

    // Send a new message instead of editing the interaction to prevent cheating by seeing the command input.
    const message = await interaction.channel.send({ content: 'Sending invite...' })
    await invitesManager.sendInvite(invite,
      inviteData,
      message,
      async () => { await this.startHangmanGame(inviteData.invited, message, word) })
  }

  private async startHangmanGame (invited: User, message: Message, word: string) {
    try {
      // Save current guild and channel to prevent multiple trivias in the same channel
      this.container.hangmanGames.push(`${message.guild?.id}:${message.channel?.id}`)
      // Store current damage. At 5 player loses the game
      let damage = 0
      const attemptedLetters: string[] = []
      // Remove previous embeds and components and show message
      await this.updateHangmanGameStatus(message, word, [], damage, this.GAME_STATUSES.GAME_START)
      if (message.channel == null) return

      const collector = message.channel.createMessageCollector({ time: 900_000 })
      collector.on('collect', async (msg) => {
      // Only accept one character messages
        if (msg.content.length !== 1) return
        // Check if message is a letter
        if (!/^[a-zA-Z]+$/i.test(msg.content)) return

        // Check if the message author is the invited user
        if (msg.author.id === invited.id) {
        // Check if the message is a valid guess
          const guess = msg.content.toLowerCase()
          // First check if letter was already attempted
          if (attemptedLetters.includes(guess)) {
            await msg.reply('You already guessed that letter!')
          } else {
            attemptedLetters.push(guess)
            if (word.includes(guess)) {
            // Check if player guessed the word, if guessed stop the collector.
              const playerWon = this.checkIfPlayerWon(word, attemptedLetters)
              if (playerWon) {
                collector.stop()
                await this.updateHangmanGameStatus(message, word, attemptedLetters, damage, this.GAME_STATUSES.WON)
              } else {
                await this.updateHangmanGameStatus(message, word, attemptedLetters, damage, this.GAME_STATUSES.CORRECT)
              }
            } else {
              damage++
              if (damage === MAX_DAMAGE) {
                collector.stop()
                await this.updateHangmanGameStatus(message, word, attemptedLetters, damage, this.GAME_STATUSES.LOST)
              } else {
                await this.updateHangmanGameStatus(message, word, attemptedLetters, damage, this.GAME_STATUSES.INCORRECT)
              }
            }
          }
        }
      })

      collector.on('end', () => {
      // Remove hangman game so another one can be played in the same channel
        this.container.hangmanGames = this.container.hangmanGames.filter((id) => id !== `${message.guild?.id}:${message.channel?.id}`)
      })
    } catch (error) {
      console.error(error)
    }
  }

  private async updateHangmanGameStatus (message: Message, word: string, attemptedLetters: string[], damage: number, gameStatus: number) {
    // Replace all letters that haven't been guessed yet with dashes but keep spaces intact
    const guessedWord = word
      .split('')
      .map((letter) => {
        if (letter === ' ') {
          return ' ' // Keep space intact
        } else {
          return attemptedLetters.includes(letter) ? letter : '-'
        }
      })
      .join('')

    // Get string from gameStatus
    let guessString = ''
    if (gameStatus === this.GAME_STATUSES.CORRECT) {
      guessString = ':white_check_mark: Correct!'
    } else if (gameStatus === this.GAME_STATUSES.INCORRECT) {
      guessString = ':x: Incorrect!'
    } else if (gameStatus === this.GAME_STATUSES.WON) {
      guessString = ':white_check_mark: **You win!**'
    } else if (gameStatus === this.GAME_STATUSES.LOST) {
      guessString = ':x: You lose! The word was: **' + word + '**'
    }

    // Update game status with next character
    const nextCharacter = this.getEmojiCharacter(damage)

    await message.edit({
      content: `
# Hangman

Enter a letter to guess!
${nextCharacter}
**${guessedWord}**

${guessString}
      `,
      embeds: [],
      components: []
    })
  }

  private getEmojiCharacter (damage: number): string {
    if (damage === 0) {
      return ':green_square:\n:green_square:\n:green_square:\n:green_square:\n:green_square:'
    } else if (damage === 1) {
      return ':tophat:\n:green_square:\n:green_square:\n:green_square:\n:green_square:'
    } else if (damage === 2) {
      return ':tophat:\n:disguised_face:\n:green_square:\n:green_square:\n:green_square:'
    } else if (damage === 3) {
      return ':tophat:\n:disguised_face:\n:shirt:\n:green_square:\n:green_square:'
    } else if (damage === 4) {
      return ':tophat:\n:disguised_face:\n:shirt:\n:shorts:\n:green_square:'
    } else {
      return ':tophat:\n:disguised_face:\n:shirt:\n:shorts:\n:athletic_shoe:'
    }
  }

  private checkIfPlayerWon (word: string, attemptedLetters: string[]): boolean {
    for (const char of word) {
      if (char === ' ') continue
      if (!attemptedLetters.includes(char)) {
        return false
      }
    }
    return true
  }

  private readonly GAME_STATUSES = {
    GAME_START: 0,
    CORRECT: 1,
    INCORRECT: 2,
    WON: 3,
    LOST: 4
  }
}

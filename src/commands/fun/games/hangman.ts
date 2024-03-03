import { Command } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type User, type ChatInputCommandInteraction, ComponentType } from 'discord.js'
import Alerts from '../../../lib/alerts/alerts'
import { addMinutes, getUnixTime } from 'date-fns'
import { delay } from '../../../lib/misc/delay'
import { type HangmanInvite } from '../../../lib/interface/hangmanInvite'
import StringAlerts from '../../../lib/alerts/stringAlerts'

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
    if (!onlyLettersRegex.test(input)) {
      return await Alerts.WARN(interaction, 'You can only enter letters for the word. (a-z)', true)
    }
    const invited = interaction.options.getUser('player', true)
    if (invited.id === interaction.user.id) return await Alerts.WARN(interaction, 'You cannot play hangman with yourself!\n\nInvite another player!', true)
    if (invited.bot) return await Alerts.WARN(interaction, 'You can\'t play hangman with a bot!\n\nInvite a human player!', true)

    const word = input.toLowerCase()
    // This additional check is just for safety, but it shouldn't be necessary
    if (word.length > 15 || word.length < 3) {
      return await Alerts.WARN(interaction, 'The word must be between 3 and 15 characters!', true)
    }

    const twoMinutesInTheFuture = getUnixTime(addMinutes(Date.now(), 2))
    // Send invite to player
    const invite = this.makeInvite(interaction.user.id, invited.displayName, twoMinutesInTheFuture)
    await this.sendInvite(invite, interaction, invited, word)
  }

  private makeInvite (inviter: string, invited: string, timestamp: number) {
    const hangmanEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Hangman Invite')
      .setDescription(`**${invited}**, **<@${inviter}>** has invited you to play hangman!\n\n**Accept invite?**\n\nInvite expires <t:${timestamp}:R>`)

    const acceptButton = new ButtonBuilder()
      .setCustomId('accept-hangman-invite')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success)

    const declineButton = new ButtonBuilder()
      .setCustomId('decline-hangman-invite')
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton)
    return { embeds: [hangmanEmbed], components: [row] }
  }

  private async sendInvite (invite: HangmanInvite, interaction: ChatInputCommandInteraction, invited: User, word: string) {
    const inviteMessage = await interaction.reply(invite)
    const collector = inviteMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120_000 })

    // Keep track if the user accepted the invite, so message isn't deleted after collector expiration.
    let accepted = false
    collector.on('collect', async (i) => {
      // Check if the user who clicked the button was the invited user
      if (i.user.id === invited.id) {
        if (i.customId === 'accept-hangman-invite') {
          accepted = true
          await this.startGame(invited, interaction, word)
        } else {
          await inviteMessage.delete()
          const declineMessage = await interaction.followUp(`<@${interaction.user.id}>, ${invited.displayName} declined your invite to play hangman.`)
          await delay(30000)
          await declineMessage.delete()
        }
      } else {
        // Another user tried to click the button
        await interaction.followUp({
          content: StringAlerts.ERROR('This invite is not for you.'),
          ephemeral: true
        })
      }
    })

    collector.on('end', async () => {
      if (!accepted) {
        await inviteMessage.delete()
        const timeoutMessage = await interaction.followUp(`<@${interaction.user.id}>, ${invited.displayName} didn't respond to the invite in time.`)
        await delay(30000)
        await timeoutMessage.delete()
      }
    })
  }

  private async startGame (invited: User, interaction: ChatInputCommandInteraction, word: string) {
    // Save current guild and channel to prevent multiple trivias in the same channel
    this.container.hangmanGames.push(`${interaction.guild?.id}:${interaction.channel?.id}`)
    // Store current damage. At 5 player loses the game
    let damage = 0
    const attemptedLetters: string[] = []
    // Remove previous embeds and components and show message
    await this.updateGameStatus(interaction, word, [], damage, this.GAME_STATUSES.GAME_START)
    if (interaction.channel == null) return

    const collector = interaction.channel.createMessageCollector({ time: 900_000 })
    collector.on('collect', async (message) => {
      // Only accept one character messages
      if (message.content.length > 1) return
      // Check if message is a letter
      if (!/^[a-zA-Z]+$/i.test(message.content)) return

      // Check if the message author is the invited user
      if (message.author.id === invited.id) {
        // Check if the message is a valid guess
        const guess = message.content.toLowerCase()
        // First check if letter was already attempted
        if (attemptedLetters.includes(guess)) {
          await message.reply('You already guessed that letter!')
        } else {
          attemptedLetters.push(guess)
          if (word.includes(guess)) {
            // Check if player guessed the word
            const playerWon = this.checkIfPlayerWon(word, attemptedLetters)
            if (playerWon) {
              collector.stop()
              await this.updateGameStatus(interaction, word, attemptedLetters, damage, this.GAME_STATUSES.WON)
            } else {
              await this.updateGameStatus(interaction, word, attemptedLetters, damage, this.GAME_STATUSES.CORRECT)
            }
          } else {
            damage++
            if (damage === 5) {
              collector.stop()
              await this.updateGameStatus(interaction, word, attemptedLetters, damage, this.GAME_STATUSES.LOST)
            } else {
              await this.updateGameStatus(interaction, word, attemptedLetters, damage, this.GAME_STATUSES.INCORRECT)
            }
          }
        }
      }
    })

    collector.on('end', () => {
      // Remove hangman game so another one can be played in the same channel
      this.container.hangmanGames = this.container.hangmanGames.filter((id) => id !== `${interaction.guild?.id}:${interaction.channel?.id}`)
    })
  }

  private async updateGameStatus (interaction: ChatInputCommandInteraction, word: string, attemptedLetters: string[], damage: number, gameStatus: number) {
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

    await interaction.editReply({
      content: `
${nextCharacter}
--------------

**HANGMAN**
Guess one letter at a time

**${guessedWord}**

${guessString}
      `,
      embeds: [],
      components: []
    })
  }

  private getEmojiCharacter (damage: number): string {
    if (damage === 0) {
      return `
:green_square:
:green_square:
:green_square:
:green_square:
:green_square:
      `
    } else if (damage === 1) {
      return `
:tophat:
:green_square:
:green_square:
:green_square:
:green_square:
      `
    } else if (damage === 2) {
      return `
:tophat:
:disguised_face:
:green_square:
:green_square:
:green_square:
      `
    } else if (damage === 3) {
      return `
:tophat:
:disguised_face:
:shirt:
:green_square:
:green_square:
      `
    } else if (damage === 4) {
      return `
:tophat:
:disguised_face:
:shirt:
:shorts:
:green_square:
      `
    } else {
      return `
:tophat:
:disguised_face:
:shirt:
:shorts:
:athletic_shoe:
      `
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

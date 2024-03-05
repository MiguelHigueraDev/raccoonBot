import { Command } from '@sapphire/framework'
import { type User, type ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js'
import Alerts from '../../../lib/alerts/alerts'
import { addMinutes, getUnixTime } from 'date-fns'
import invitesManager from '../../../lib/games/invitesManager'
import { type InviteData } from '../../../lib/interface/gameInvite'
import { type TicTacToeGame } from '../../../lib/interface/ticTacToe'

export class TicTacToeCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'tictactoe',
      description: 'Play a game of tic-tac-toe with another player (or with me).',
      cooldownDelay: 30000
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
    , {
      idHints: ['1214409088130088960']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Check if invited player is human or is the bot
    const invited = interaction.options.getUser('player', true)
    if (invited.bot && invited.id !== interaction.client.id) {
      return await Alerts.WARN(interaction, 'You can\'t play tic-tac-toe with a bot (besides me)!', true)
    }

    // Check if player is themselves
    if (invited.id === interaction.user.id) return await Alerts.WARN(interaction, 'You can\'t play tic-tac-toe with yourself!\n\nInvite another player (or me)!', true)

    if (!invited.bot) {
    // If invited player is a human player, send invite
      const twoMinutesInTheFuture = getUnixTime(addMinutes(Date.now(), 2))
      const inviteData: InviteData = { inviter: interaction.user, invited, timestamp: twoMinutesInTheFuture, game: 'Tic-Tac-Toe' }
      const inviteEmbed = invitesManager.makeInvite(inviteData)
      await invitesManager.sendInvite(inviteEmbed,
        inviteData,
        interaction,
        async () => { await this.startHumanTicTacToeGame(inviteData.invited, interaction) }
      )
    } else {
      // If sent to the bot, start AI game
      await this.startAITicTacToeGame(interaction)
    }
  }

  private async startHumanTicTacToeGame (invited: User, interaction: ChatInputCommandInteraction) {
    // Coinflip to determine who goes first
    const firstPlayer = Math.random() < 0.5
    let player1, player2: User
    if (firstPlayer) {
      player1 = interaction.user
      player2 = invited
    } else {
      player1 = invited
      player2 = interaction.user
    }

    // Get initial game board
    const game: TicTacToeGame = {
      gameboard: [['', '', ''], ['', '', ''], ['', '', '']],
      player1,
      player2,
      currentPlayer: player1,
      status: this.GAME_STATUSES.ACTIVE
    }

    const gameboardEmbed = this.getGameboardEmbed(game)
    const buttons = this.getButtons(game)
    const gameMessage = await interaction.editReply({ embeds: [gameboardEmbed], components: buttons, content: '' })

    const collector = gameMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 900_000 })

    collector.on('collect', async (i) => {
      // Check if the user who clicked the button was the current player
      if (i.user.id === game.currentPlayer.id) {
        // Acknowledge the button click
        const reply = await i.reply({ content: 'Play received...', ephemeral: true })
        await reply.delete()
        // Check if the button clicked was a valid button
        if (i.customId.startsWith('tictactoe_')) {
          // Get row and column that was clicked
          const row = parseInt(i.customId.split('tictactoe_')[1].split('_')[0], 10)
          const col = parseInt(i.customId.split('tictactoe_')[1].split('_')[1], 10)

          // Update gameboard and next player
          const currentPlayerSymbol = game.currentPlayer.id === game.player1.id ? 'X' : 'O'
          game.gameboard[row][col] = currentPlayerSymbol

          // Check the game status and also return next game turn
          const nextTurn = this.nextTurn(game)
          if (nextTurn.status !== this.GAME_STATUSES.ACTIVE) {
            // Game ended, stop the collector
            collector.stop()
          }
          game.currentPlayer = nextTurn.currentPlayer

          // Redraw the embed and buttons
          const nextEmbed = this.getGameboardEmbed(nextTurn)
          const nextButtons = this.getButtons(nextTurn)
          await gameMessage.edit({ embeds: [nextEmbed], components: nextButtons })
        }
      } else {
        await i.reply({ content: 'It\'s not your turn!', ephemeral: true })
      }
    })
  }

  private async startAITicTacToeGame (interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: 'Sadly, AI hasn\'t been implemented yet. Stay tuned for the release!', ephemeral: true })
  }

  private nextTurn (game: TicTacToeGame) {
    const { player1, player2, currentPlayer } = game
    let nextPlayer: User

    // Update game status
    const status = this.checkGameStatus(game)

    // Switch current player
    if (currentPlayer.id === player1.id) {
      nextPlayer = player2
    } else {
      nextPlayer = player1
    }

    // Make a new game and return it
    const nextTurn: TicTacToeGame = {
      ...game, currentPlayer: nextPlayer, status
    }
    return nextTurn
  }

  private checkGameStatus (game: TicTacToeGame): number {
    // Check if there's a winner
    const winner = this.checkWinner(game)
    if (winner !== null) {
      return winner
    }

    // Check if there is a tie
    if (this.checkTie(game)) {
      return this.GAME_STATUSES.TIE
    }

    // No tie or winner, continue with the game
    return this.GAME_STATUSES.ACTIVE
  }

  private checkWinner (game: TicTacToeGame): number | null {
    const { gameboard } = game
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (gameboard[i][0] === gameboard[i][1] && gameboard[i][1] === gameboard[i][2] && gameboard[i][0] !== '') {
        return (gameboard[i][0] === 'X') ? this.GAME_STATUSES.X_WIN : this.GAME_STATUSES.O_WIN
      }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
      if (gameboard[0][i] === gameboard[1][i] && gameboard[1][i] === gameboard[2][i] && gameboard[0][i] !== '') {
        return (gameboard[0][i] === 'X') ? this.GAME_STATUSES.X_WIN : this.GAME_STATUSES.O_WIN
      }
    }

    // Check diagonals
    if (gameboard[0][0] !== '' && gameboard[0][0] === gameboard[1][1] && gameboard[1][1] === gameboard[2][2]) {
      return (gameboard[0][0] === 'X') ? this.GAME_STATUSES.X_WIN : this.GAME_STATUSES.O_WIN
    }
    if (gameboard[0][2] !== '' && gameboard[0][2] === gameboard[1][1] && gameboard[1][1] === gameboard[2][0]) {
      return (gameboard[0][2] === 'X') ? this.GAME_STATUSES.X_WIN : this.GAME_STATUSES.O_WIN
    }

    return null
  }

  private checkTie (game: TicTacToeGame): boolean {
    const { gameboard } = game
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (gameboard[i][j] === '') {
          return false
        }
      }
    }
    return true
  }

  private getGameboardEmbed (game: TicTacToeGame) {
    const { gameboard, currentPlayer } = game
    const currentPlayerSymbol = (currentPlayer.id === game.player1.id) ? 'X' : 'O'
    // Check if there is a winner
    let footerText = ''
    if (game.status === this.GAME_STATUSES.X_WIN) {
      footerText = `${game.player1.displayName} wins!`
    } else if (game.status === this.GAME_STATUSES.O_WIN) {
      footerText = `${game.player2.displayName} wins!`
    } else if (game.status === this.GAME_STATUSES.TIE) {
      footerText = 'Tie!'
    } else {
      footerText = `It's ${currentPlayer.displayName} (${currentPlayerSymbol})'s turn!`
    }

    const gameboardEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Tic-Tac-Toe')
      .setFooter({ text: footerText })

    let grid = ''

    for (let i = 0; i < 3; i++) {
      const text1 = (gameboard[i][0] === 'X') ? ':x:' : (gameboard[i][0] === 'O') ? ':o:' : ':blue_square:'
      const text2 = (gameboard[i][1] === 'X') ? ':x:' : (gameboard[i][1] === 'O') ? ':o:' : ':blue_square:'
      const text3 = (gameboard[i][2] === 'X') ? ':x:' : (gameboard[i][2] === 'O') ? ':o:' : ':blue_square:'

      grid += `${text1}   ${text2}   ${text3}\n\n`
    }

    gameboardEmbed.setDescription(grid)

    return gameboardEmbed
  }

  private getButtons (game: TicTacToeGame) {
    const { gameboard } = game
    const rows = []
    // If game ended, disable all buttons
    const isGameEnded = this.checkGameStatus(game) !== this.GAME_STATUSES.ACTIVE
    for (let i = 0; i < 3; i++) {
      const row = new ActionRowBuilder<ButtonBuilder>()
      for (let j = 0; j < 3; j++) {
        row.addComponents(new ButtonBuilder()
          .setCustomId(`tictactoe_${i}_${j}`)
          .setLabel('*')
          .setStyle(gameboard[i][j] !== '' || isGameEnded ? ButtonStyle.Danger : ButtonStyle.Primary)
          .setDisabled(gameboard[i][j] !== '' || isGameEnded))
      }
      rows.push(row)
    }
    return rows
  }

  private readonly GAME_STATUSES = {
    ACTIVE: 0,
    X_WIN: 1,
    O_WIN: 2,
    TIE: 3
  }
}

import { type ChatInputCommandInteraction, ComponentType, type User } from 'discord.js'
import { type TicTacToeGame } from '../interface/ticTacToe'
import ticTacToeCommon from './ticTacToeCommon'

const startGame = async (invited: User, interaction: ChatInputCommandInteraction) => {
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
    status: ticTacToeCommon.GAME_STATUSES.ACTIVE
  }

  const gameboardEmbed = ticTacToeCommon.getGameboardEmbed(game)
  const buttons = ticTacToeCommon.getButtons(game)
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
        const nextTurn = ticTacToeCommon.nextTurn(game)
        if (nextTurn.status !== ticTacToeCommon.GAME_STATUSES.ACTIVE) {
          // Game ended, stop the collector
          collector.stop()
        }
        game.currentPlayer = nextTurn.currentPlayer

        // Redraw the embed and buttons
        const nextEmbed = ticTacToeCommon.getGameboardEmbed(nextTurn)
        const nextButtons = ticTacToeCommon.getButtons(nextTurn)
        await gameMessage.edit({ embeds: [nextEmbed], components: nextButtons })
      }
    } else {
      await i.reply({ content: 'It\'s not your turn!', ephemeral: true })
    }
  })
}

const ticTacToeHumanController = {
  startGame
}

export default ticTacToeHumanController

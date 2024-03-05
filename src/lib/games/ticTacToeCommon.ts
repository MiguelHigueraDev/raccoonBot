import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type User } from 'discord.js'
import { type TicTacToeGame } from '../interface/ticTacToe'

const checkGameStatus = (game: TicTacToeGame): number => {
  // Check if there's a winner
  const winner = checkWinner(game)
  if (winner !== null) {
    return winner
  }

  // Check if there is a tie
  if (checkTie(game)) {
    return GAME_STATUSES.TIE
  }

  // No tie or winner, continue with the game
  return GAME_STATUSES.ACTIVE
}

const checkWinner = (game: TicTacToeGame): number | null => {
  const { gameboard } = game
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (gameboard[i][0] === gameboard[i][1] && gameboard[i][1] === gameboard[i][2] && gameboard[i][0] !== '') {
      return (gameboard[i][0] === 'X') ? GAME_STATUSES.X_WIN : GAME_STATUSES.O_WIN
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (gameboard[0][i] === gameboard[1][i] && gameboard[1][i] === gameboard[2][i] && gameboard[0][i] !== '') {
      return (gameboard[0][i] === 'X') ? GAME_STATUSES.X_WIN : GAME_STATUSES.O_WIN
    }
  }

  // Check diagonals
  if (gameboard[0][0] !== '' && gameboard[0][0] === gameboard[1][1] && gameboard[1][1] === gameboard[2][2]) {
    return (gameboard[0][0] === 'X') ? GAME_STATUSES.X_WIN : GAME_STATUSES.O_WIN
  }
  if (gameboard[0][2] !== '' && gameboard[0][2] === gameboard[1][1] && gameboard[1][1] === gameboard[2][0]) {
    return (gameboard[0][2] === 'X') ? GAME_STATUSES.X_WIN : GAME_STATUSES.O_WIN
  }

  return null
}

const checkTie = (game: TicTacToeGame): boolean => {
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

const getGameboardEmbed = (game: TicTacToeGame) => {
  const { gameboard, currentPlayer } = game
  const currentPlayerSymbol = (currentPlayer.id === game.player1.id) ? 'X' : 'O'
  // Check if there is a winner
  let footerText = ''
  if (game.status === GAME_STATUSES.X_WIN) {
    footerText = `${game.player1.displayName} wins!`
  } else if (game.status === GAME_STATUSES.O_WIN) {
    footerText = `${game.player2.displayName} wins!`
  } else if (game.status === GAME_STATUSES.TIE) {
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

const getButtons = (game: TicTacToeGame) => {
  const { gameboard } = game
  const rows = []
  // If game ended, disable all buttons
  const isGameEnded = checkGameStatus(game) !== GAME_STATUSES.ACTIVE
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

const nextTurn = (game: TicTacToeGame) => {
  const { player1, player2, currentPlayer } = game
  let nextPlayer: User

  // Update game status
  const status = checkGameStatus(game)

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

const GAME_STATUSES = {
  ACTIVE: 0,
  X_WIN: 1,
  O_WIN: 2,
  TIE: 3
}

const ticTacToeCommon = {
  getButtons, checkGameStatus, checkWinner, getGameboardEmbed, nextTurn, GAME_STATUSES
}

export default ticTacToeCommon

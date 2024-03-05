import { type User } from 'discord.js'

export interface TicTacToeGame {
  gameboard: string[][]
  currentPlayer: User
  player1: User
  player2: User
  status: number
}

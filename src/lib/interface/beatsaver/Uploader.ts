import { type Type } from './Type'

export interface Uploader {
  id: number
  name: string
  uniqueSet: boolean
  hash: string
  avatar: string
  type: Type
  admin: boolean
  curator: boolean
  seniorCurator: boolean
  playlistUrl: string
}

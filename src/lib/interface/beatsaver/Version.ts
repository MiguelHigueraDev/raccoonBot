import { type MapDifficulty } from './MapDifficulty'
import { type MapState } from './MapState'

export interface Version {
  hash: string
  key: string
  state: MapState
  createdAt: string
  sageScore: number
  diffs: MapDifficulty[]
  downloadURL: string
  coverURL: string
  previewURL: string
}

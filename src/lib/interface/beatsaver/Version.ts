import { type MapState } from './MapState'

export interface Version {
  hash: string
  key: string
  state: MapState
  createdAt: string
  sageScore: number
}

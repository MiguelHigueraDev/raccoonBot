import { type MapCharacteristic } from './MapCharacteristic'
import { type MapDifficultyString } from './MapDifficultyString'
import { type MapParitySummary } from './MapParitySummary'

export interface MapDifficulty {
  bombs: number
  characteristic: MapCharacteristic
  chroma: boolean
  cinema: boolean
  difficulty: MapDifficultyString
  events: number
  label: string
  maxScore: number
  me: boolean
  ne: boolean
  njs: number | undefined
  notes: number
  nps: number
  obstacles: number
  offset: number | undefined
  seconds: number
  stars: number | undefined
  paritySummary: MapParitySummary
}

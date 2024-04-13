import { type Metadata } from './Metadata'
import { type Stats } from './MapStats'
import { type Uploader } from './Uploader'
import { type Version } from './Version'
import { type DeclaredAi } from './DeclaredAi'
import { type Tag } from './Tag'

export interface Map {
  id: string
  name: string
  description: string
  uploader: Uploader
  metadata: Metadata
  stats: Stats
  tags: Tag[]
  uploaded: string
  automapper: boolean
  ranked: boolean
  qualified: boolean
  versions: Version[]
  createdAt: string
  updatedAt: string
  lastPublishedAt: string
  bookmarked: boolean
  declaredAi: DeclaredAi
}

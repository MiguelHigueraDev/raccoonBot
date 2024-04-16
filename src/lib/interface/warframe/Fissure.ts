export interface Fissure {
  id: string
  activation: string
  startString: string
  expiry: string
  active: boolean
  node: string
  missionType: string
  missionKey: string
  enemy: 'Corpus' | 'Grineer' | 'Infested' | 'Orokin' | 'Crossfire'
  enemyKey: string
  nodeKey: string
  tier: 'Lith' | 'Meso' | 'Neo' | 'Axi' | 'Requiem' | 'Omnia'
  tierNum: number
  expired: boolean
  eta: string
  isStorm: boolean
  isHard: boolean
}

// https://docs.warframestat.us/#tag/Worldstate/operation/getCetusByPlatform
export interface CetusCycle {
  id: string
  expiry: string
  activation: string
  isDay: boolean
  state: string
  timeLeft: string
  isCetus: boolean
  shortString: string
}

const ERROR = (string: string): string => {
  return ':octagonal_sign: **Error:**\n' + string
}

const WARN = (string: string): string => {
  return ':warning: **Warning:**\n' + string
}

const INFO = (string: string): string => {
  return ':information_source: **Information:**\n' + string
}

const SUCCESS = (string: string): string => {
  return ':white_check_mark: **Success:**\n' + string
}

const StringAlerts = {
  ERROR, WARN, INFO, SUCCESS
}

export default StringAlerts

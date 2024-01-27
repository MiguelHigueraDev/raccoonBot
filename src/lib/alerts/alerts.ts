import { type InteractionResponse, type ChatInputCommandInteraction } from 'discord.js'

const ERROR = async (interaction: ChatInputCommandInteraction, string: string, ephemeral: boolean = false): Promise<InteractionResponse> => {
  try {
    return await interaction.reply({
      content: ':octagonal_sign: **Error:**\n' + string,
      ephemeral
    })
  } catch (error) {
    console.error(error)
    return await Promise.reject(error)
  }
}

const WARN = async (interaction: ChatInputCommandInteraction, string: string, ephemeral: boolean = false): Promise<InteractionResponse> => {
  try {
    return await interaction.reply({
      content: ':warning: **Warning:**\n' + string,
      ephemeral
    })
  } catch (error) {
    console.error(error)
    return await Promise.reject(error)
  }
}

const INFO = async (interaction: ChatInputCommandInteraction, string: string, ephemeral: boolean = false): Promise<InteractionResponse> => {
  try {
    return await interaction.reply({
      content: ':information_source: **Information:**\n' + string,
      ephemeral
    })
  } catch (error) {
    console.error(error)
    return await Promise.reject(error)
  }
}

const SUCCESS = async (interaction: ChatInputCommandInteraction, string: string, ephemeral: boolean = false): Promise<InteractionResponse> => {
  try {
    return await interaction.reply({
      content: ':white_check_mark: **Success:**\n' + string,
      ephemeral
    })
  } catch (error) {
    console.error(error)
    return await Promise.reject(error)
  }
}

const Alerts = {
  ERROR, WARN, INFO, SUCCESS
}

export default Alerts

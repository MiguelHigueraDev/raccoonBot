import { type Message, type ChatInputCommandInteraction, type InteractionResponse } from 'discord.js'
import { shuffleArray } from '../random/shuffleUtils'
import { EmbedBuilder } from 'discord.js'

export const ShowLoadingScreen = async (interaction: ChatInputCommandInteraction): Promise<Message<boolean> | InteractionResponse<boolean>> => {
  try {
    const loadingMessage: string = shuffleArray(LOADING_MESSAGES)[0]
    const loadingEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('<a:loading:1205300536396484659> ' + loadingMessage)
    return await interaction.reply({ embeds: [loadingEmbed], fetchReply: true })
  } catch (error) {
    console.error(error)
    return await Promise.reject(error)
  }
}

const LOADING_MESSAGES: string[] = [
  'Loading...', 'Fetching data from the internet...', 'Please wait...', 'Hang on...', 'Just a sec...', 'Just a moment...',
  'Almost there...', 'Reticulating splines...'
]

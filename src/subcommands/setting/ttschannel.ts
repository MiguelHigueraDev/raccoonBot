import { type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import settingsHandler from '../../lib/database/settingsHandler'
import { Settings } from '../../constants/bot-config/settings'
import { checkChannelPermissions } from '../../lib/permissions/checkPermissions'

export const updateTtsChannel = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.guild === null) throw new Error('This command cannot be executed in a DM.')
  const value = interaction.options.getChannel('channel')?.id
  const guildId = interaction.guild.id

  try {
    if (value == null) throw new Error('You need to specify a valid channel.')

    const checkPermissions = await checkChannelPermissions(guildId, interaction.client.user.id, value)
    if (!checkPermissions) return await Alerts.ERROR(interaction, 'I don\'t have permission to see and/or send messages in that channel.\nPlease change the permissions or choose another channel.', true)

    const update = await settingsHandler.updateSetting(guildId, Settings.ttschannel, value)
    if (!update) throw new Error('An error occurred while updating the TTS channel.')

    return await Alerts.SUCCESS(interaction, `The TTS channel has been updated to <#${value}>.`, true)
  } catch (error) {
    console.error(error)
    return await Alerts.ERROR(interaction, 'An error occurred while updating the TTS channel.', true)
  }
}

import { type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import settingsHandler from '../../lib/database/settingsHandler'
import { Settings } from '../../constants/settings/settings'

export const updateMainChannel = async (interaction: ChatInputCommandInteraction) => {
  if (interaction.guild === null) throw new Error('This command cannot be executed in a DM.')
  const value = interaction.options.getChannel('channel')?.id
  const guildId = interaction.guild.id

  try {
    if (value == null) throw new Error('You need to specify a valid channel.')

    const update = await settingsHandler.updateSetting(guildId, Settings.mainchannel, value)
    if (!update) throw new Error('An error occurred while updating the main channel.')

    return await Alerts.SUCCESS(interaction, `The main channel has been updated to <#${value}>.`, true)
  } catch (error) {
    console.error(error)
    return await Alerts.ERROR(interaction, 'An error occurred while updating the main channel.', true)
  }
}

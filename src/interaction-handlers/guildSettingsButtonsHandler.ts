import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework'
import { type ButtonInteraction } from 'discord.js'
import { getSettingEmbed } from '../commands/guildAdmin/settings'
import StringAlerts from '../lib/alerts/stringAlerts'
import guildHandler from '../lib/database/guildHandler'
import settingsHandler from '../lib/database/settingsHandler'

export class GuildSettingsButtonsHandler extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    })
  }

  public override parse (interaction: ButtonInteraction) {
    if (interaction.customId !== 'nextSetting' && interaction.customId !== 'prevSetting' && interaction.customId !== 'resetSetting') return this.none()
    return this.some()
  }

  public async run (interaction: ButtonInteraction) {
    if (interaction.guild === null) return

    // Pagination
    if (interaction.customId === 'prevSetting' || interaction.customId === 'nextSetting') {
      try {
        const currentPage = getCurrentIndex(interaction)
        const page = (interaction.customId === 'prevSetting') ? currentPage - 1 : currentPage + 1
        const { embed, components }: any = await getSettingEmbed(page, interaction.guild.id)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        return await interaction.update({
          content: StringAlerts.ERROR('An error has occured while browsing settings. Please try running the /settings command again.')
        })
      }
    }

    // Toggling setting
    if (interaction.customId === 'resetSetting') {
      try {
        const guildId = interaction.guild.id
        const currentSetting = getCurrentIndex(interaction)
        const checkGuild = await guildHandler.updateGuildStatus(guildId)
        if (!checkGuild) throw new Error('Error checking or storing guild in database')

        // Reset setting
        const resetSetting = await settingsHandler.resetSetting(guildId, currentSetting)
        if (!resetSetting) throw new Error('Error resetting setting')

        const { embed, components }: any = await getSettingEmbed(currentSetting, guildId)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        return await interaction.update({
          content: StringAlerts.ERROR('An error has occured while resetting setting. Please try running the /settings command again.')
        })
      }
    }
  }
}

const getCurrentIndex = (interaction: ButtonInteraction) => {
  if (interaction.message.embeds[0].footer === null) throw new Error('Invalid embed.')
  const pageText = interaction.message.embeds[0].footer.text
  const slashPos = pageText.indexOf('/')
  // Calculate index starting position using Setting + space
  const currentPage = +pageText.substring('Setting'.length + 1, slashPos)
  return currentPage
}

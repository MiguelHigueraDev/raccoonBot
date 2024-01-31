import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework'
import { type ButtonInteraction } from 'discord.js'
import StringAlerts from '../lib/alerts/stringAlerts'
import { getModuleEmbed } from '../commands/guildAdmin/modules'
import guildHandler from '../lib/database/guildHandler'
import preferenceHandler from '../lib/database/preferenceHandler'
import { getPreferenceEmbed } from '../commands/preferences/preferences'

export class UserPreferencesButtonsHandler extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    })
  }

  public override parse (interaction: ButtonInteraction) {
    if (interaction.customId !== 'nextPreference' && interaction.customId !== 'prevPreference' && interaction.customId !== 'enablePreference' && interaction.customId !== 'disablePreference') return this.none()
    return this.some()
  }

  public async run (interaction: ButtonInteraction) {
    if (interaction.guild === null) return

    // Pagination
    if (interaction.customId === 'prevPreference' || interaction.customId === 'nextPreference') {
      try {
        const currentPage = getCurrentIndex(interaction)
        const page = (interaction.customId === 'prevPreference') ? currentPage - 1 : currentPage + 1
        const { embed, components }: any = await getModuleEmbed(page, interaction.guild.id)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        return await interaction.update({
          content: StringAlerts.ERROR('An error has occured while browsing preferences. Please try running the /preferences command again.')
        })
      }
    }

    // Toggling preferences
    if (interaction.customId === 'enablePreference' || interaction.customId === 'disablePreference') {
      try {
        const guildId = interaction.guild.id
        const userId = interaction.user.id
        const currentPref = getCurrentIndex(interaction)
        // Check if guild is stored in the database first
        const checkGuild = await guildHandler.updateGuildStatus(guildId)
        if (!checkGuild) throw new Error('Error checking or storing guild in database')

        if (interaction.customId === 'enablePreference') {
          const enablePreference = await preferenceHandler.enablePreference(guildId, userId, currentPref)
          if (!enablePreference) throw new Error('Error enabling preference.')
        } else {
          const disablePreference = await preferenceHandler.disablePreference(guildId, userId, currentPref)
          if (!disablePreference) throw new Error('Error disabling preference.')
        }

        const { embed, components }: any = await getPreferenceEmbed(guildId, userId, currentPref)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        await interaction.update({
          content: StringAlerts.ERROR('An error has occured while browsing preferences. Please try running the /preferences command again.')
        })
      }
    }
  }
}

const getCurrentIndex = (interaction: ButtonInteraction) => {
  if (interaction.message.embeds[0].footer === null) throw new Error('Invalid embed.')
  const pageText = interaction.message.embeds[0].footer.text
  const slashPos = pageText.indexOf('/')
  // Calculate index starting position using Preference + space
  const currentPage = +pageText.substring('Preference'.length + 1, slashPos)
  return currentPage
}

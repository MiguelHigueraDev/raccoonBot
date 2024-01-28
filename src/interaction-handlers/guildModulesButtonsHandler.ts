import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework'
import type { ButtonInteraction } from 'discord.js'
import StringAlerts from '../lib/alerts/stringAlerts'
import { getModuleEmbed } from '../commands/guildAdmin/modules'
import guildHandler from '../lib/database/guildHandler'
import moduleHandler from '../lib/database/moduleHandler'

export class GuildModulesButtonsHandler extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    })
  }

  public override parse (interaction: ButtonInteraction) {
    if (interaction.customId !== 'nextModule' && interaction.customId !== 'prevModule' && interaction.customId !== 'enableModule' && interaction.customId !== 'disableModule') return this.none()
    return this.some()
  }

  public async run (interaction: ButtonInteraction) {
    if (interaction.guild === null) return
    // Pagination
    if (interaction.customId === 'prevModule' || interaction.customId === 'nextModule') {
      try {
        const currentPage = getCurrentIndex(interaction)
        const page = (interaction.customId === 'prevModule') ? currentPage - 1 : currentPage + 1
        const { embed, components }: any = await getModuleEmbed(page, interaction.guild.id)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        return await interaction.update({
          content: StringAlerts.ERROR('An error has occured while browsing modules. Please try running the /modules command again.')
        })
      }
    }

    // Toggling module
    if (interaction.customId === 'enableModule' || interaction.customId === 'disableModule') {
      try {
        const guildId = interaction.guild.id
        const currentModule = getCurrentIndex(interaction)
        // Check if guild is stored in the database first
        const checkGuild = await guildHandler.updateGuildStatus(guildId)
        if (!checkGuild) throw new Error('Error checking or storing guild in database')

        if (interaction.customId === 'enableModule') {
          const enableModule = await moduleHandler.enableModule(guildId, currentModule)
          if (!enableModule) throw new Error('Error enabling module.')
        } else {
          const disableModule = await moduleHandler.disableModule(guildId, currentModule)
          if (!disableModule) throw new Error('Error disabling module.')
        }

        const { embed, components }: any = await getModuleEmbed(currentModule, guildId)
        return await interaction.update({ content: '', embeds: [embed], components })
      } catch (error) {
        console.error(error)
        await interaction.update({
          content: StringAlerts.ERROR('An error has occured while toggling module. Please try running the /modules command again.')
        })
      }
    }
  }
}

const getCurrentIndex = (interaction: ButtonInteraction) => {
  if (interaction.message.embeds[0].footer === null) throw new Error('Invalid embed.')
  const pageText = interaction.message.embeds[0].footer.text
  const slashPos = pageText.indexOf('/')
  // Calculate index starting position using Module + space
  const currentPage = +pageText.substring('Module'.length + 1, slashPos)
  return currentPage
}

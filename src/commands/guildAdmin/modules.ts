import { Command, container } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import moduleHandler from '../../lib/database/moduleHandler'
import { type EmbedObject } from '../../lib/interface/embedObject'

export class ModulesCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'modules',
      description: '[SERVER ADMIN ONLY] Enable/disable server modules.',
      requiredUserPermissions: [PermissionFlagsBits.Administrator],
      cooldownDelay: 15000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description),
    {
      idHints: ['1201207600155480246', '1203384536520589382']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Fetch module from database
    if (interaction.guild === null) return await Alerts.ERROR(interaction, 'This command cannot be executed in a DM.', true)
    const module = await getModuleEmbed(1, interaction.guild.id)
    if (module instanceof Error) {
      return await Alerts.ERROR(interaction, 'Error creating embed.', true)
    }
    const { embed, components } = module as EmbedObject
    return await interaction.reply({ embeds: [embed], components, ephemeral: true })
  }
}

/**
 * Retrieves an embed and interactive components for a specific module.
 *
 * @async
 * @function
 * @param {number} moduleIndex - The index of the module to retrieve.
 * @param {string} guildId - The ID of the guild for which the module is requested.
 * @returns {Promise<{ embed: EmbedBuilder, components: ActionRowBuilder[] } | Error>} A promise that resolves to an object containing the embed and interactive components, or rejects with an error if the module is not found or an error occurs.
 *
 * @throws {Error} If the module is not found or an error occurs during the retrieval process.
 */
export const getModuleEmbed = async (moduleIndex: number, guildId: string) => {
  try {
    const module = await container.db.module.findUnique({
      where: {
        id: moduleIndex
      }
    })
    if (module === null) throw new Error('Module not found.')

    // First check if module is stored in the database for this guild, if not try to store it
    const moduleExists = await moduleHandler.checkIfModuleExists(guildId, moduleIndex)
    if (!moduleExists) throw new Error('Module not found.')

    const pageCount = await container.db.module.count()
    const queryModule = await container.db.guildModules.findUnique({ where: { guildId_moduleId: { guildId, moduleId: moduleIndex } } })
    const isModuleEnabled = queryModule?.enabled

    const { name, description } = module

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({ name: 'Server Modules' })
      .setTitle(name)
      .setDescription(description)
      .setFooter({ text: 'Module ' + moduleIndex + '/' + pageCount })

    const prevButton = new ButtonBuilder().setCustomId('prevModule').setLabel('<<').setStyle(ButtonStyle.Secondary).setDisabled(moduleIndex === 1)
    const enableButton = new ButtonBuilder().setCustomId('enableModule').setLabel('Enable').setStyle(ButtonStyle.Success)
    const disableButton = new ButtonBuilder().setCustomId('disableModule').setLabel('Disable').setStyle(ButtonStyle.Danger)
    const nextButton = new ButtonBuilder().setCustomId('nextModule').setLabel('>>').setStyle(ButtonStyle.Secondary).setDisabled(moduleIndex === pageCount)

    // Create action rows
    const enableRow = new ActionRowBuilder().addComponents(prevButton, enableButton, nextButton)
    const disableRow = new ActionRowBuilder().addComponents(prevButton, disableButton, nextButton)
    // Shows if module === 1, which is just an introduction.
    const neutralRow = new ActionRowBuilder().addComponents(prevButton, nextButton)

    if (moduleIndex === 1) {
      return { embed, components: [neutralRow] }
    }

    if (isModuleEnabled === 1) {
      embed.addFields({
        name: 'Current status: ', value: ':white_check_mark: **Enabled in this server**'
      })
      return { embed, components: [disableRow] }
    } else {
      embed.addFields({
        name: 'Current status: ', value: ':no_entry_sign: **Disabled in this server**'
      })
      return { embed, components: [enableRow] }
    }
  } catch (error) {
    return error
  }
}

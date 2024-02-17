import { Command, container } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import preferenceHandler from '../../lib/database/preferenceHandler'
import { type EmbedObject } from '../../lib/interface/embedObject'

export class PreferencesCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'preferences',
      description: 'Toggle preferences for the current server.',
      cooldownDelay: 15000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description),
    {
      idHints: ['1202036953139122287', '1203384450898071583']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Fetch preference from database
    if (interaction.guild === null) return await Alerts.ERROR(interaction, 'This command cannot be executed in a DM.', true)
    const preference = await getPreferenceEmbed(interaction.guild.id, interaction.user?.id, 1)
    if (preference instanceof Error) {
      return await Alerts.ERROR(interaction, 'Error creating embed.', true)
    }
    const { embed, components } = preference as EmbedObject
    return await interaction.reply({ embeds: [embed], components, ephemeral: true })
  }
}

export const getPreferenceEmbed = async (guildId: string, userId: string, preferenceIndex: number) => {
  try {
    const preference = await container.db.preference.findUnique({
      where: {
        id: preferenceIndex
      }
    })
    if (preference === null) throw new Error('Preference not found.')

    const preferenceExists = await preferenceHandler.checkIfPreferenceExists(guildId, userId, preferenceIndex)
    if (!preferenceExists) throw new Error('Preference not found.')

    const pageCount = await container.db.preference.count()
    const queryPreference = await container.db.userPreferences.findUnique({
      where: {
        guildId_preferenceId_userId: {
          guildId, preferenceId: preferenceIndex, userId
        }
      }
    })
    const isPreferenceEnabled = queryPreference?.enabled

    const { name, description } = preference

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({ name: 'Your preferences' })
      .setTitle(name)
      .setDescription(description)
      .setFooter({ text: 'Preference ' + preferenceIndex + '/' + pageCount })

    const prevButton = new ButtonBuilder().setCustomId('prevPreference').setLabel('<<').setStyle(ButtonStyle.Secondary).setDisabled(preferenceIndex === 1)
    const enableButton = new ButtonBuilder().setCustomId('enablePreference').setLabel('Enable').setStyle(ButtonStyle.Success)
    const disableButton = new ButtonBuilder().setCustomId('disablePreference').setLabel('Disable').setStyle(ButtonStyle.Danger)
    const nextButton = new ButtonBuilder().setCustomId('nextPreference').setLabel('>>').setStyle(ButtonStyle.Secondary).setDisabled(preferenceIndex === pageCount)

    // Create action rows
    const enableRow = new ActionRowBuilder().addComponents(prevButton, enableButton, nextButton)
    const disableRow = new ActionRowBuilder().addComponents(prevButton, disableButton, nextButton)

    if (isPreferenceEnabled === 1) {
      embed.addFields({
        name: 'Current status: ', value: ':white_check_mark: **Enabled**'
      })
      return { embed, components: [disableRow] }
    } else {
      embed.addFields({
        name: 'Current status: ', value: ':no_entry_sign: **Disabled**'
      })
      return { embed, components: [enableRow] }
    }
  } catch (error) {
    return error
  }
}

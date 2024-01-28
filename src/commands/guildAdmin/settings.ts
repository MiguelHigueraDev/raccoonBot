import { Command, container } from '@sapphire/framework'
import { type ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import settingsHandler from '../../lib/database/settingsHandler'

export class SettingsCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'settings',
      description: '[SERVER ADMIN ONLY] Show a list of server settings',
      requiredUserPermissions: [PermissionFlagsBits.Administrator],
      runIn: ['GUILD_TEXT']
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description),
    {
      idHints: ['1201249904174043317']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Fetch setting from database
    if (interaction.guild === null) return await Alerts.ERROR(interaction, 'This command cannot be executed in a DM.', true)

    const module = await getSettingEmbed(1, interaction.guild.id)
    if (module instanceof Error) {
      return await Alerts.ERROR(interaction, 'Error creating embed.', true)
    }
    const { embed, components } = module as SettingObject
    return await interaction.reply({ embeds: [embed], components, ephemeral: true })
  }
}

export interface SettingObject {
  embed: EmbedBuilder
  components: Array<ActionRowBuilder<any>>
}

export const getSettingEmbed = async (settingIndex: number, guildId: string) => {
  try {
    // First check if setting is stored in the database for this guild, if not try to store it.
    const settingExists = await settingsHandler.checkIfSettingExists(guildId, settingIndex)
    if (!settingExists) throw new Error('Could not store setting in database..')

    const setting = await container.db.guildSettings.findUnique({
      where: {
        guildId_settingId: {
          guildId, settingId: settingIndex
        }
      },
      include: {
        setting: true
      }
    })
    if (setting === null) throw new Error('Setting not found in database.')

    const pageCount = await container.db.setting.count()
    const { name, description, commandPlaceholder, commandName, type } = setting.setting
    const settingValue = (setting.value === '') ? '_Not specified_' : setting.value

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setAuthor({ name: 'Server Settings' })
      .setTitle(name)
      .setDescription(description)
      .addFields(
        { name: 'To change this setting use: ', value: `**/setting ${commandName} ${commandPlaceholder}**` }
      )
      .setFooter({ text: 'Setting ' + settingIndex + '/' + pageCount })

    // Formatting for some specific options
    if (settingValue === '_Not specified_') {
      embed.addFields({ name: 'Current value: ', value: `${settingValue}` })
    } else {
      if (type === 'channel') {
        embed.addFields({ name: 'Current value: ', value: `<#${settingValue}>` })
      } else {
        embed.addFields({ name: 'Current value: ', value: `${settingValue}` })
      }
    }

    const prevButton = new ButtonBuilder().setCustomId('prevSetting').setLabel('<<').setStyle(ButtonStyle.Secondary).setDisabled(settingIndex === 1)
    const resetSetting = new ButtonBuilder().setCustomId('resetSetting').setLabel('Reset to default / clear').setStyle(ButtonStyle.Danger)
    const resetSettingDisabled = new ButtonBuilder().setCustomId('resetSettingDisabled').setLabel('Reset to default / clear').setStyle(ButtonStyle.Danger).setDisabled(true)
    const nextButton = new ButtonBuilder().setCustomId('nextSetting').setLabel('>>').setStyle(ButtonStyle.Secondary).setDisabled(settingIndex === pageCount)

    const modifiedRow = new ActionRowBuilder().addComponents(prevButton, resetSetting, nextButton)
    const baseRow = new ActionRowBuilder().addComponents(prevButton, resetSettingDisabled, nextButton)

    if (settingValue === '_Not specified_') {
      return { embed, components: [baseRow] }
    } else {
      return { embed, components: [modifiedRow] }
    }
  } catch (error) {
    console.error(error)
    return error
  }
}

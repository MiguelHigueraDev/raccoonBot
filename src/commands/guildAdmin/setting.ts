import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import { checkIfUserIsGuildAdmin } from '../../lib/permissions/checkPermissions'
import { updateMainChannel } from '../../subcommands/setting/mainchannel'
import { updateTtsChannel } from '../../subcommands/setting/ttschannel'

export class SettingCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'setting',
      description: '[SERVER ADMIN ONLY] Edit server settings',
      cooldownDelay: 15000
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    if (interaction.guild === null) return await Alerts.ERROR(interaction, 'This command cannot be executed in a DM.', true)
    const isAdmin = await checkIfUserIsGuildAdmin(interaction.guild, interaction.user.id)
    if (!isAdmin) {
      return await Alerts.ERROR(interaction, 'Only server administrators have permission to use this command.', true)
    }

    const subcommand = interaction.options.getSubcommand()
    if (subcommand === 'mainchannel') {
      return await updateMainChannel(interaction)
    }
    if (subcommand === 'ttschannel') {
      return await updateTtsChannel(interaction)
    }
  }
}

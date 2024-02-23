import { Command } from '@sapphire/framework'
import { type Message, type ChatInputCommandInteraction, type InteractionResponse } from 'discord.js'
import { shuffleArray } from '../../lib/random/shuffleUtils'
import { splitString } from '../../lib/arrays/arrayUtils'
import { checkChannelPermissions } from '../../lib/permissions/checkPermissions'
import Alerts from '../../lib/alerts/alerts'
import checkMessageStillExists from '../../lib/misc/checkMessageStillExists'

export class ShuffleCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'shuffle',
      aliases: ['shuf'],
      description: 'Shuffle a comma-separated list of items.',
      cooldownDelay: 5000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('list')
            .setDescription('Comma-separated list of items.')
            .setRequired(true)
        ), {
      idHints: ['1200846688248672357', '1203384454345654382']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<undefined | InteractionResponse<boolean> | Message<boolean>> {
    if (interaction.guild != null) {
      const hasPermission = await checkChannelPermissions(interaction.guild.id, interaction.user.id, interaction.channelId)
      if (!hasPermission) {
        return await Alerts.ERROR(interaction, 'I can\'t send messages to this channel! Please try another one.', true)
      }
    }

    const list = interaction.options.getString('list', true)
    const array = splitString(list)
    const reply = await interaction.reply({ content: '**Shuffling list...**', fetchReply: true })
    // Add extra shuffles in case there are 3 items or less
    const shuffles = (array.length <= 3) ? array.length * 2 : array.length
    for (let i = 0; i < shuffles; i++) {
      // Check if message was deleted to prevent crash
      if (!checkMessageStillExists(interaction, reply.id)) return

      await reply.edit({ content: shuffleArray(array).join(', ') })
      await new Promise(resolve => setTimeout(resolve, 700))
    }
    const finalRoll: string = shuffleArray(array).join(', ')
    if (!checkMessageStillExists(interaction, reply.id)) return
    return await reply.edit({ content: `**${finalRoll}**` })
  }
}

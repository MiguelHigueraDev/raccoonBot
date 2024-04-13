import { Command } from '@sapphire/framework'
import type { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import { shuffleArray } from '../../lib/random/shuffleUtils'
import { splitString } from '../../lib/arrays/arrayUtils'
import { checkChannelPermissions } from '../../lib/permissions/checkPermissions'

export class RandItemCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'randitem',
      aliases: ['ritem'],
      description: 'Get a random item from a comma-separated list.',
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
        )
    )
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

    if (array.length < 2) return await Alerts.WARN(interaction, 'Please provide at least two items separated by commas.', true)

    try {
      const reply = await interaction.reply({ content: 'Shuffling...', fetchReply: true })
      // Add extra shuffles in case there are 3 items or less
      const shuffles = (array.length <= 3) ? array.length * 2 : array.length
      for (let i = 0; i < shuffles; i++) {
        await reply.edit({ content: shuffleArray(array)[0] })
        await new Promise(resolve => setTimeout(resolve, 700))
      }
      const finalRoll: string = shuffleArray(array)[0]
      return await reply.edit({ content: `**${finalRoll}**` })
    } catch (error) {
      console.error('[randitem] Error:', error)
    }
  }
}

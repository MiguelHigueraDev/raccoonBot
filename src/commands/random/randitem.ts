import { Command } from '@sapphire/framework'
import type { ChatInputCommandInteraction, InteractionResponse, Message } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import { shuffleArray } from '../../lib/random/shuffleUtils'
import { splitString } from '../../lib/arrays/arrayUtils'

export class RandItemCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'randitem',
      aliases: ['ritem'],
      description: 'Get a random item from a comma-separated list.',
      cooldownDelay: 3000
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
    , {
      idHints: ['1200846684025016342', '1203384456107261963']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<undefined | InteractionResponse<boolean> | Message<boolean>> {
    const list = interaction.options.getString('list', true)
    const array = splitString(list)

    if (array.length < 2) return await Alerts.WARN(interaction, 'Please provide at least two items separated by commas.', true)

    const reply = await interaction.reply({ content: 'Shuffling...', fetchReply: true })
    // Add extra shuffles in case there are 3 items or less
    const shuffles = (array.length <= 3) ? array.length * 2 : array.length
    for (let i = 0; i < shuffles; i++) {
      // Check if message was deleted to prevent crash
      const msgStillExists = await interaction.channel?.messages.fetch(reply.id).catch(() => null)
      if (msgStillExists == null) return
      await reply.edit({ content: shuffleArray(array)[0] })
      await new Promise(resolve => setTimeout(resolve, 700))
    }
    const finalRoll: string = shuffleArray(array)[0]
    const msgStillExists = await interaction.channel?.messages.fetch(reply.id).catch(() => null)
    if (msgStillExists == null) return
    return await reply.edit({ content: `**${finalRoll}**` })
  }
}

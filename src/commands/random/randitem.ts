import { Command } from '@sapphire/framework'
import type { ChatInputCommandInteraction, Message } from 'discord.js'

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
      idHints: ['1200782619420401695']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<Message> {
    const list = interaction.options.getString('list', true)
    const array = list.split(',')
    for (const el of array) {
      el.trim()
    }

    if (array.length < 2) return
  }
}

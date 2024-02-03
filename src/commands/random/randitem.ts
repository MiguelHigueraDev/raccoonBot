import { Command } from '@sapphire/framework'
import type { ChatInputCommandInteraction, InteractionResponse } from 'discord.js'
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
      idHints: ['1200846684025016342']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const list = interaction.options.getString('list', true)
    const array = splitString(list)

    if (array.length < 2) return await Alerts.WARN(interaction, 'Please provide at least two items separated by commas.', true)

    const firstItem: string = shuffleArray(array)[0]
    return await interaction.reply(firstItem)
  }
}

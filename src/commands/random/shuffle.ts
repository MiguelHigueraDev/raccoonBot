import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction, type InteractionResponse } from 'discord.js'
import { shuffleArray } from '../../lib/random/shuffleUtils'
import { splitString } from '../../lib/arrays/arrayUtils'

export class ShuffleCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'shuffle',
      aliases: ['shuf'],
      description: 'Shuffle a comma-separated list of items.',
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
        ), {
      idHints: ['1200846688248672357']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const list = interaction.options.getString('list', true)
    const array = splitString(list)
    const shuffledArray = shuffleArray(array).join(', ')
    return await interaction.reply(shuffledArray)
  }
}

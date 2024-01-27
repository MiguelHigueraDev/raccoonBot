import { Command } from '@sapphire/framework'
import { type InteractionResponse, type ChatInputCommandInteraction } from 'discord.js'
import { splitString } from '../../lib/arrays/arrayUtils'
import Alerts from '../../lib/alerts/alerts'
import { shuffleArray } from '../../lib/random/shuffleUtils'

export class RandTeamsCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'randteams',
      aliases: ['rteams'],
      description: 'Shuffle a list of people into two teams, up to 20 people.',
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
            .setDescription('Comma-separated list of people to shuffle.')
            .setRequired(true)
        ), {
      idHints: ['1200846686176678059']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const list = interaction.options.getString('list', true)
    const array = splitString(list)

    if (array.length < 2) return await Alerts.WARN(interaction, 'Please provide at least two people separated by commas.', true)
    if (array.length > 20) return await Alerts.WARN(interaction, 'Only a maximum of 20 people are allowed.', true)

    const shuffledArray = shuffleArray(array)

    const firstTeam = shuffledArray.slice(0, Math.ceil(shuffledArray.length / 2)).join(', ')
    const secondTeam = shuffledArray.slice(Math.ceil(shuffledArray.length / 2)).join(', ')

    return await interaction.reply(`:red_square: **Team 1**: ${firstTeam}\n:blue_square: **Team 2**: ${secondTeam}`)
  }
}

import { Command } from '@sapphire/framework'
import { type InteractionResponse, type ChatInputCommandInteraction } from 'discord.js'

export class DateFormatCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'dateformat',
      description: 'Convert a local date to a Discord timestamp',
      cooldownDelay: 3000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption((option) =>
          option
            .setName('current-hour')
            .setDescription('Your current time in 24 hour format. (0-23)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(23))
        .addNumberOption((option) =>
          option
            .setName('year')
            .setDescription('The year for your date')
            .setRequired(true)
            .setMinValue(2000)
            .setMaxValue(2100))
        .addNumberOption((option) =>
          option
            .setName('month')
            .setDescription('The month for your date')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
        .addNumberOption((option) =>
          option
            .setName('day')
            .setDescription('The day for your date')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31))
        .addNumberOption((option) =>
          option
            .setName('hour')
            .setDescription('The hour(s) for your date in 24 hour format (0-23)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(23))
        .addNumberOption((option) =>
          option
            .setName('minute')
            .setDescription('The minute(s) for your date (0-59)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(59))
        .addStringOption((option) =>
          option
            .setName('format-type')
            .setDescription('Select the format type from the list')
            .setRequired(true)
            .addChoices(
              { name: 'Short Time (4:56 PM)', value: 'T' },
              { name: 'Long Time (4:56:00 PM)', value: 't' },
              { name: 'Short Date (1/20/2023)', value: 'd' },
              { name: 'Long Date (January 20 2023)', value: 'D' },
              { name: 'Short Date/Time (January 20 2023 4:56 PM)', value: 'f' },
              { name: 'Long Date/Time (Friday, January 20 2023 4:56:00 PM)', value: 'F' },
              { name: 'Relative Time (6 months ago)', value: 'R' }
            )
        )
        .addNumberOption((option) =>
          option
            .setName('second')
            .setDescription('The second for your date (0-59)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(59))
    , {
      idHints: ['1214763690956562502']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const currentHour = interaction.options.getNumber('current-hour', true)
    const year = interaction.options.getNumber('year', true)
    const month = interaction.options.getNumber('month', true)
    const day = interaction.options.getNumber('day', true)
    const hour = interaction.options.getNumber('hour', true)
    const minute = interaction.options.getNumber('minute', true)
    const second = interaction.options.getNumber('second', false)
    const formatType = interaction.options.getString('format-type', true)

    // Get local current hour and calculate difference
    const localCurrentHour = new Date().getHours()
    const hourDifference = currentHour - localCurrentHour

    let date = new Date()
    if (second != null) {
      date = new Date(year, month - 1, day, hour - hourDifference, minute, second, 0)
    } else {
      date = new Date(year, month - 1, day, hour - hourDifference, minute, 0, 0)
    }

    const timestamp = date.getTime() / 1000
    return await interaction.reply(`Date preview: <t:${timestamp}:${formatType}>\n\nCopy it: \`<t:${timestamp}:${formatType}>\``)
  }
}

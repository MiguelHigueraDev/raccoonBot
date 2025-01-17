import { Command } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import { addDays, addHours, addMinutes } from 'date-fns'
import pollHandler from '../../lib/database/pollHandler'

export class PollCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'poll',
      description: 'Create a poll',
      cooldownDelay: 1_800_000 // 30 minutes
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('question')
            .setDescription('The question to ask')
            .setRequired(true)
            .setMaxLength(150)
        )
        .addStringOption((option) =>
          option
            .setName('options')
            .setDescription('Comma-separated list of options (2-8)')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('expiration')
            .setDescription('(OPTIONAL) When the poll should expire. Default: in 1 day.')
            .setRequired(false)
            .addChoices({ name: 'in 30 minutes', value: '30m' }, { name: 'in 4 hours', value: '4h' }, { name: 'in 8 hours', value: '8h' }, { name: 'in 1 day', value: '1d' }, { name: 'in 3 days', value: '3d' }, { name: 'in 1 week', value: '7d' })))
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString('question', true)
    const options = interaction.options.getString('options', true)
    const expiration = interaction.options.getString('expiration') ?? '1d'

    const optionsArray = options.split(',').map((q) => q.trim())

    const validation = this.validateData(optionsArray, question)
    if (validation !== true) {
      return await Alerts.ERROR(interaction, validation, true)
    }

    // Get expiration date
    const expirationDate = this.getDate(expiration)
    const expirationDateUnix = Math.floor(expirationDate.getTime() / 1000)

    const pollInsert = await pollHandler.createPoll(interaction.user.id, optionsArray, question, expirationDate)
    if (pollInsert === false) {
      return await Alerts.WARN(interaction, 'Error creating poll in the database. Please try again.', true)
    }

    const pollEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(question)
      .setFooter({ text: `ID: ${pollInsert}`, iconURL: interaction.user.displayAvatarURL() })

    // Add options
    for (let i = 0; i < optionsArray.length; i++) {
      const emoji = emojiMap[i + 1]
      pollEmbed.addFields({ name: `${emoji} ${optionsArray[i]}`, value: '0 votes (0%)' })
    }
    pollEmbed.addFields({ name: 'Total votes: 0', value: `Expires <t:${expirationDateUnix}:R>` })
    const pollButtons = this.createButtons(optionsArray.length)

    return await interaction.reply({ embeds: [pollEmbed], components: pollButtons })
  }

  private readonly validateData = (options: string[], question: string): string | true => {
    if (options.length < 2 || options.length > 8) {
      return 'Please provide between 2 and 8 options separated by commas.'
    }

    // Check if there are duplicate options
    if (new Set(options).size !== options.length) {
      return 'Cannot enter duplicate options. Please try again.'
    }

    // Check all the options are below 100 characters
    for (const option of options) {
      if (option.length > 100) {
        return 'Each option must be below 100 characters. Please try again.'
      }
    }
    if (question.length > 150) {
      return 'The question must be below 150 characters. Please try again.'
    }

    return true
  }

  private readonly getDate = (expiration: string): Date => {
    const curDate = new Date()
    if (expiration === '30m') {
      return addMinutes(curDate, 30)
    } else if (expiration === '4h') {
      return addHours(curDate, 4)
    } else if (expiration === '8h') {
      return addHours(curDate, 8)
    } else if (expiration === '1d') {
      return addDays(curDate, 1)
    } else if (expiration === '3d') {
      return addDays(curDate, 3)
    } else {
      return addDays(curDate, 7)
    }
  }

  private readonly createButtons = (qty: number) => {
    if (qty < 2 || qty > 8) return
    const firstRow = new ActionRowBuilder<ButtonBuilder>()
    const secondRow = new ActionRowBuilder<ButtonBuilder>()
    for (let i = 0; i < qty; i++) {
      const button = new ButtonBuilder().setCustomId('pollOption' + (i + 1)).setLabel((i + 1).toString()).setStyle(ButtonStyle.Primary)
      if (i < 4) firstRow.addComponents(button)
      else secondRow.addComponents(button)
    }
    // Only return second row if there are more than 4 options
    if (secondRow.components.length > 0) return [firstRow, secondRow]
    else return [firstRow]
  }
}

export const emojiMap: any = {
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:',
  7: ':seven:',
  8: ':eight:'
}

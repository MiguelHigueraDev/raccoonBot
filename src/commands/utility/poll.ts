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
      description: 'Create a poll'
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
            .addChoices({ name: 'in 30 minutes', value: '30m' }, { name: 'in 4 hours', value: '4h' }, { name: 'in 8 hours', value: '8h' }, { name: 'in 1 day', value: '1d' }, { name: 'in 3 days', value: '3d' }, { name: 'in 1 week', value: '7d' })), {
      idHints: ['1203426607352512513', '1203860721247719444']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString('question', true)
    const options = interaction.options.getString('options', true)
    const expiration = interaction.options.getString('expiration') ?? '1d'
    const creator = interaction.user.displayName

    const optionsArray = options.split(',').map((q) => q.trim())
    if (optionsArray.length < 2 || optionsArray.length > 8) {
      return await Alerts.WARN(interaction, 'Please provide between 2 and 8 options separated by commas.', true)
    }

    // Check if there are duplicate options
    if (new Set(optionsArray).size !== optionsArray.length) {
      return await Alerts.WARN(interaction, 'Cannot enter duplicate options. Please try again.', true)
    }

    // Check all the options are below 100 characters
    for (const option of optionsArray) {
      if (option.length > 100) {
        return await Alerts.WARN(interaction, 'Each option must be below 100 characters. Please try again.', true)
      }
    }
    if (question.length > 150) {
      return await Alerts.WARN(interaction, 'The question must be below 150 characters. Please try again.', true)
    }

    // Get expiration date
    const expirationDate = this.getDate(expiration)
    const expirationDateUnix = Math.floor(expirationDate.getTime() / 1000)

    const pollInsert = await pollHandler.createPoll(interaction.user.id, optionsArray, question, expirationDate)
    if (pollInsert === false) {
      return await Alerts.WARN(interaction, 'Error creating poll. Please try again.', true)
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
    pollEmbed.addFields({ name: `Poll created by: ${creator}.`, value: `Expires <t:${expirationDateUnix}:R>` })
    const pollButtons = this.createButtons(optionsArray.length)

    return await interaction.reply({ embeds: [pollEmbed], components: pollButtons })
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

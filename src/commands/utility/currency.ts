import { Command } from '@sapphire/framework'
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { CURRENCY_LIST } from '../../constants/externalApis/currencyList'
import { config } from 'dotenv'
import StringAlerts from '../../lib/alerts/stringAlerts'
config()
const CURR_API_KEY = process.env.FREE_CURRENCY_API_KEY

export class CurrencyCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'currency',
      description: 'Convert from one currency to another',
      cooldownDelay: 3_600_600 // 1 hour,
    })
  }

  public override registerApplicationCommands (
    registry: Command.Registry
  ): void {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .setDMPermission(false)
          .addNumberOption((option) =>
            option
              .setName('amount')
              .setDescription('The amount to convert')
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName('from')
              .setDescription('The currency to convert from')
              .setRequired(true)
              .addChoices(...CURRENCY_LIST)
          )
          .addStringOption((option) =>
            option
              .setName('to')
              .setDescription('The currency to convert to')
              .setRequired(true)
              .addChoices(...CURRENCY_LIST)
          ),
      {
        idHints: ['1220797768126304277', '1220799837432184872']
      }
    )
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const message = await interaction.deferReply()
    const amount = interaction.options.getNumber('amount', true)
    const from = interaction.options.getString('from', true)
    const to = interaction.options.getString('to', true)

    // Fetch data from currency API
    const API_URL = 'https://api.freecurrencyapi.com/v1/latest'
    const response = await fetch(`${API_URL}?apikey=${CURR_API_KEY}&base_currency=${from}&currencies=${to}`)
    if (!response.ok) return await message.edit({ content: StringAlerts.ERROR('An error occurred while fetching data from the API.'), embeds: [] })

    const json = await response.json()
    if (json.data == null) return await message.edit({ content: StringAlerts.ERROR('An error occurred while fetching data from the API.'), embeds: [] })

    // Data is valid
    console.log(json.data)
    const finalAmount = amount * json.data[to]
    const embed = new EmbedBuilder().setColor('Blurple')
      .setTitle(`${amount} ${from} = ${finalAmount.toFixed(2)} ${to}`)
    await message.edit({ content: '', embeds: [embed] })
  }
}

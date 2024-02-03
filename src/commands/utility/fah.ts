import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction, type InteractionResponse } from 'discord.js'

export class FahCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'fah',
      description: 'Convert temperature from degrees Fahrenheit to degrees Celsius'
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addNumberOption((option) =>
          option
            .setName('fahrenheit')
            .setDescription('Temperature in degrees Fahrenheit to convert')
            .setRequired(true)
            .setMaxValue(50000)
            .setMinValue(-50000)
        ), {
      idHints: ['1200897090662977598', '1203384621987922020']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const fahrenheit = interaction.options.getNumber('fahrenheit', true)
    const celsius = Math.round((fahrenheit - 32) * (5 / 9))
    return await interaction.reply(`${fahrenheit}°F is ${celsius}°C`)
  }
}

import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction, type InteractionResponse } from 'discord.js'

export class CelCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'cel',
      description: 'Convert temperature from degrees Celsius to degrees Fahrenheit',
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
            .setName('celsius')
            .setDescription('Temperature in degrees Celsius to convert')
            .setRequired(true)
            .setMaxValue(50000)
            .setMinValue(-50000)
        ), {
      idHints: ['1200897088494501978', '1203384623338623058']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<InteractionResponse<boolean>> {
    const celsius = interaction.options.getNumber('celsius', true)
    const fahrenheit = Math.round(celsius * (9 / 5) + 32)
    return await interaction.reply(`${celsius}°C is ${fahrenheit}°F`)
  }
}

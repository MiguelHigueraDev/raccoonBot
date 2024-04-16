import { Command } from '@sapphire/framework'
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { type Fissure } from '../../../lib/interface/warframe/Fissure'
import { WF_RELICS } from '../../../constants/emojis/emojis'

export class WfFissuresCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'wf-fissures',
      description: 'Show all the available void fissures in Warframe.',
      cooldownDelay: 10000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('type')
            .setDescription('Type of fissures to show (normal | steel path | storm) (default: normal)')
            .setRequired(false)
            .addChoices(
              { name: 'Normal', value: 'normal' },
              { name: 'Steel Path', value: 'steel-path' },
              { name: 'Storm', value: 'storm' }
            )
        )
    )
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const fissureType = interaction.options.getString('type') ?? 'normal'
    const fissures = await this.getFissuresData()
    if (fissures == null) {
      return await interaction.reply('There was an error while fetching data from the Warframe API.')
    }

    if (fissures.length === 0) {
      return await interaction.reply('There are no active fissures at the moment.')
    }

    const embed = await this.getFissuresEmbed(fissures, fissureType as 'normal' | 'steel-path' | 'storm')
    await interaction.reply({ embeds: [embed] })
  }

  private async getFissuresData (): Promise<Fissure[] | null> {
    try {
      const fissures = await fetch('https://api.warframestat.us/pc/fissures')
      const fissuresData = await fissures.json()
      const filtered = fissuresData.filter((fissure: Fissure) => !fissure.expired)
      return filtered
    } catch {
      return null
    }
  }

  private async getFissuresEmbed (fissures: Fissure[], fissureType: 'normal' | 'steel-path' | 'storm') {
    const embed = new EmbedBuilder()
      .setColor('Blurple')

    let filteredFissures = null

    switch (fissureType) {
      case 'normal':
        filteredFissures = fissures.filter((fissure) => !fissure.isStorm && !fissure.isHard)
        embed.setTitle('Active Fissures - Normal')
        break
      case 'steel-path':
        filteredFissures = fissures.filter((fissure) => !fissure.isStorm && fissure.isHard)
        embed.setTitle('Active Fissures - Steel Path')
        break
      case 'storm':
        filteredFissures = fissures.filter((fissure) => fissure.isStorm)
        embed.setTitle('Active Fissures - Void Storm')
        break
    }

    filteredFissures.sort((a, b) => a.tierNum - b.tierNum)

    for (const fissure of filteredFissures) {
      const expiration = Math.floor(new Date(fissure.expiry).getTime() / 1000)
      embed.addFields({
        name: `${WF_RELICS[fissure.tier]} ${fissure.missionType} - ${fissure.node}`,
        value: `Expires <t:${expiration}:R>`
      })
    }

    return embed
  }
}

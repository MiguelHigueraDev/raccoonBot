import { Command } from '@sapphire/framework'
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { type Cycles } from '../../../lib/interface/warframe/Cycles'
import Alerts from '../../../lib/alerts/alerts'
import { capitalize } from '../../../lib/string/stringUtils'

export class WfCyclesCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'wf-cycles',
      description: 'Get the current cycle status for Warframe.',
      cooldownDelay: 10000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description), {
      idHints: ['1228524409699172473', '1228531770195185675']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const cycles = await this.getCyclesData()
    if (cycles == null) {
      return await Alerts.ERROR(interaction, 'There was an error while fetching data from the Warframe API.', true)
    }

    const embed = this.getCyclesEmbed(cycles)
    await interaction.reply({ embeds: [embed] })
  }

  /**
    * Retrieves the cycles data for Cambion, Cetus, Earth, and Vallis from the Warframe API.
    * @returns A Promise that resolves to an object containing the cycles data, or null if an error occurs.
    */
  private async getCyclesData (): Promise<Cycles | null> {
    try {
      const [cambionCycle, cetusCycle, earthCycle, vallisCycle] = await Promise.all([
        fetch('https://api.warframestat.us/pc/cambionCycle'),
        fetch('https://api.warframestat.us/pc/cetusCycle'),
        fetch('https://api.warframestat.us/pc/earthCycle'),
        fetch('https://api.warframestat.us/pc/vallisCycle')
      ])

      const cycles: Cycles = {
        cambion: await cambionCycle.json(),
        cetus: await cetusCycle.json(),
        earth: await earthCycle.json(),
        vallis: await vallisCycle.json()
      }

      // Change timeLeft to unix timestamp
      cycles.cambion.expiry = (new Date(cycles.cambion.expiry).getTime() / 1000).toFixed(0) + ''
      cycles.cetus.expiry = (new Date(cycles.cetus.expiry).getTime() / 1000).toFixed(0) + ''
      cycles.earth.expiry = (new Date(cycles.earth.expiry).getTime() / 1000).toFixed(0) + ''
      cycles.vallis.expiry = (new Date(cycles.vallis.expiry).getTime() / 1000).toFixed(0) + ''
      return cycles
    } catch (error) {
      console.error(error)
      return null
    }
  }

  /**
 * Returns an EmbedBuilder object containing information about Warframe cycles.
 * @param cycles - The cycles object containing information about different cycles.
 * @returns An EmbedBuilder object with formatted cycle information.
 */
  private getCyclesEmbed (cycles: Cycles): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('Warframe Cycles')
      .setColor('Blurple')
      .addFields([
        { name: 'Cambion Drift', value: `**State:** ${capitalize(cycles.cambion.state)}\n**Changes:** <t:${cycles.cambion.expiry}:R>` },
        { name: 'Cetus', value: `**Time:** ${capitalize(cycles.cetus.state)}\n**Changes:** <t:${cycles.cetus.expiry}:R>` },
        { name: 'Earth', value: `**Time:** ${capitalize(cycles.earth.state)}\n**Changes:** <t:${cycles.earth.expiry}:R>` },
        { name: 'Orb Vallis', value: `**State:** ${capitalize(cycles.vallis.state)}\n**Changes:** <t:${cycles.vallis.expiry}:R>` }
      ])

    return embed
  }
}

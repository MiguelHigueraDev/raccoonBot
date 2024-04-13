import { Command } from '@sapphire/framework'
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { type Map } from '../../../lib/interface/beatsaver/Map'
import { BEAT_SABER_EMOJIS, BEAT_SABER_MAP_CHARS } from '../../../constants/emojis/emojis'
import { format } from 'date-fns'
export const BEAT_SABER_EMBED_COLOR = '#eb4034'

export class BsMapCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'bs-map',
      description: 'Get information for a Beat Saber map from BeatSaver',
      cooldownDelay: 7000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('map-id')
            .setDescription('The map ID.')
            .setRequired(true)
            .setMaxLength(30)
        ), {
      idHints: ['1228463306684239972', '1228498297950572676']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()
    const mapId = interaction.options.getString('map-id', true)
    let map = null

    try {
      map = await this.getMap(mapId)
    } catch (error) {
      console.error('bs-map error:', error)
      return await interaction.editReply({
        content: 'An error occurred while fetching the map. Please try again later.'
      })
    }

    if (map == null) {
      return await interaction.editReply({
        content: 'Map not found in BeatSaver. Check the ID is correct.'
      })
    }

    // Retrieve the first version of the map
    const firstVersion = map.versions[0]

    const mapEmbed = this.getMapEmbed(map)
    const beatSaverButtons = this.getButtons(firstVersion.downloadURL, map.id)
    const mp3Preview = await this.getPreview(firstVersion.previewURL)
    await interaction.editReply({ embeds: [mapEmbed], components: [beatSaverButtons] })

    // Only send the preview if it was successfully fetched
    if (mp3Preview != null) {
      return await interaction.followUp({ files: [mp3Preview] })
    }
  }

  /**
   * Retrieves a Beat Saber map from the BeatSaver API based on the provided map ID.
   * @param mapId The ID of the map to retrieve.
   * @returns A Promise that resolves to the retrieved map, or undefined if the request fails.
   */
  private async getMap (mapId: string): Promise<Map | null> {
    const apiUrl = `https://api.beatsaver.com/maps/id/${mapId}`
    const response = await fetch(apiUrl)
    if (!response.ok) return null
    return await response.json()
  }

  /**
   * Returns an EmbedBuilder object for displaying a Beat Saber map.
   * @param map - The map object containing the map details.
   * @returns The EmbedBuilder object for the map.
   */
  private getMapEmbed (map: Map): EmbedBuilder {
    const firstVersion = map.versions[0]
    const mapEmbed = new EmbedBuilder()
      .setColor(BEAT_SABER_EMBED_COLOR)
      .setTitle(map.name)
      .setThumbnail(firstVersion.coverURL)
      .setFooter({ text: `Map ID: ${map.id} | Mapped by ${map.metadata.levelAuthorName}` })

    // Add ranked status
    if (map.ranked) mapEmbed.setDescription('**Ranked Map**')

    // Add difficulties with their respective characteristic
    const difficulties = firstVersion.diffs
    for (const diff of difficulties) {
      // Only add stars if the map is a ranked map
      const starsString = diff.stars != null ? `${BEAT_SABER_EMOJIS.star} ${diff.stars.toFixed(2)}  ` : ''
      // Retrieves the current char emoji from the map's current characteristic
      const charEmoji = BEAT_SABER_MAP_CHARS[diff.characteristic.toLowerCase() as keyof typeof BEAT_SABER_MAP_CHARS]
      mapEmbed.addFields({
        name: `${charEmoji} ${diff.difficulty}`,
        value: `${starsString}${BEAT_SABER_EMOJIS.notes} ${diff.notes}   ${BEAT_SABER_EMOJIS.njs} ${diff.njs}   ${BEAT_SABER_EMOJIS.nps} ${diff.nps.toFixed(2)}   ${BEAT_SABER_EMOJIS.bombs} ${diff.bombs}   ${BEAT_SABER_EMOJIS.walls} ${diff.obstacles}   ${BEAT_SABER_EMOJIS.lights} ${diff.events}`
      })
    }

    // Add tags if they are present
    if (map.tags != null && map.tags.length > 0) {
      mapEmbed.addFields({ name: 'Tags', value: map.tags.join(', ') })
    }

    // Add duration, BPM (if present), and rating expressed as a percentage (if present)
    const minutes = format(map.metadata.duration * 1000, 'mm:ss')
    mapEmbed.addFields({ name: 'Duration', value: minutes, inline: true })
    if (map.metadata.bpm != null) {
      mapEmbed.addFields({ name: 'BPM', value: map.metadata.bpm.toString(), inline: true })
    }
    if (map.stats.score != null) {
      mapEmbed.addFields({ name: 'Rating', value: `${(map.stats.score * 100).toFixed(2)}% (${map.stats.upvotes} / ${map.stats.downvotes})`, inline: true })
    }

    return mapEmbed
  }

  /**
   * Retrieves a preview of a Beat Saber map as a buffer from the specified URL.
   * @param url - The URL of the map preview.
   * @returns A Promise that resolves to an AttachmentBuilder containing the map preview as a Buffer.
   */
  private async getPreview (url: string) {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    return new AttachmentBuilder(Buffer.from(buffer)).setName('map-preview.mp3')
  }

  /**
   * Returns an ActionRowBuilder containing two buttons: one for viewing the map on BeatSaver and one for downloading the map.
   * @param downloadUrl - The URL for downloading the map.
   * @param mapId - The ID of the map on BeatSaver.
   * @returns An ActionRowBuilder containing the buttons.
   */
  private getButtons (downloadUrl: string, mapId: string): ActionRowBuilder<ButtonBuilder> {
    const beatSaverButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('View on BeatSaver').setURL(`https://beatsaver.com/maps/${mapId}`)
    const downloadButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download Map').setURL(downloadUrl)

    return new ActionRowBuilder<ButtonBuilder>().addComponents([beatSaverButton, downloadButton])
  }
}

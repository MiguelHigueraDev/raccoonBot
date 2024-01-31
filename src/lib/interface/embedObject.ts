import { type EmbedBuilder, type ActionRowBuilder } from 'discord.js'

export interface EmbedObject {
  embed: EmbedBuilder
  components: Array<ActionRowBuilder<any>>
}

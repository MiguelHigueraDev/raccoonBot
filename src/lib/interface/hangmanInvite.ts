import { type ActionRowBuilder, type ButtonBuilder, type EmbedBuilder } from 'discord.js'

export interface HangmanInvite {
  embeds: EmbedBuilder[]
  components: Array<ActionRowBuilder<ButtonBuilder>>
}

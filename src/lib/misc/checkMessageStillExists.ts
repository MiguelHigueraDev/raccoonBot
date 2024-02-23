import { type ChatInputCommandInteraction } from 'discord.js'

export default function checkMessageStillExists (interaction: ChatInputCommandInteraction, messageId: string): boolean {
  if (interaction.channel == null) return false
  const message = interaction.channel.messages.cache.get(messageId)
  if (message == null) return false
  return true
}

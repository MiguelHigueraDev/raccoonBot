import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'

export function makeInvite (inviter: string, invited: string, timestamp: number, game: string) {
  const hangmanEmbed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle(`${game} Invite`)
    .setDescription(`**${invited}**, **<@${inviter}>** has invited you to play ${game}!\n\n**Accept invite?**\n\nInvite expires <t:${timestamp}:R>`)

  const acceptButton = new ButtonBuilder()
    .setCustomId(`accept-${game.toLowerCase()}-invite`)
    .setLabel('Accept')
    .setStyle(ButtonStyle.Success)

  const declineButton = new ButtonBuilder()
    .setCustomId(`decline-${game.toLowerCase()}-invite`)
    .setLabel('Decline')
    .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton)
  return { embeds: [hangmanEmbed], components: [row] }
}

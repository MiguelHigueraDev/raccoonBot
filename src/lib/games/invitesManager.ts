/**
 * This module handles game invites
 * makeInvite: Creates an invite embed
 * sendInvite: Sends the invite and handles the collector. If the invite is accepted the callback passed to it is called
 */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ChatInputCommandInteraction, EmbedBuilder, Message, ComponentType } from 'discord.js'
import { delay } from '../misc/delay'
import { type InviteEmbed, type InviteData } from '../interface/gameInvite'

const makeInvite = (data: InviteData): InviteEmbed => {
  const inviteEmbed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle(`${data.game} Invite`)
    .setDescription(`**${data.invited.displayName}**, **<@${data.inviter.id}>** has invited you to play ${data.game}!\n\n**Accept invite?**\n\nInvite expires <t:${data.timestamp}:R>`)

  const acceptButton = new ButtonBuilder()
    .setCustomId(`accept-${data.game.toLowerCase()}-invite`)
    .setLabel('Accept')
    .setStyle(ButtonStyle.Success)

  const declineButton = new ButtonBuilder()
    .setCustomId(`decline-${data.game.toLowerCase()}-invite`)
    .setLabel('Decline')
    .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton)
  return { embeds: [inviteEmbed], components: [row] }
}

const sendInvite = async (invite: InviteEmbed, data: InviteData, message: Message | ChatInputCommandInteraction, startGame: InviteCallBack) => {
  try {
    // First check if message is an interaction or an actual message
    let inviteMessage
    if (message instanceof Message) {
      inviteMessage = await message.edit({ ...invite, content: '' })
    } else {
      inviteMessage = await message.reply({ ...invite, content: '' })
    }

    const collector = inviteMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120_000 })
    // Keep track if the user accepted or declined the invite, so message isn't deleted after collector expiration.
    let inviteResponded = false
    collector.on('collect', async (i) => {
      // Check if the user who clicked the button was the invited user
      if (i.user.id === data.invited.id) {
        inviteResponded = true
        if (i.customId === `accept-${data.game.toLowerCase()}-invite`) {
          // Reply to interaction to acknowledge it
          await i.reply({ content: 'Invitation accepted!', ephemeral: true })
          await delay(1000)
          await i.deleteReply()
          collector.stop()
          // Execute callback
          await startGame()
        } else if (i.customId === `decline-${data.game.toLowerCase()}-invite`) {
          // Delete invite message
          if (message instanceof Message) {
            await message.edit({ content: `<@${data.inviter.id}>, ${data.invited.displayName} declined your invite to play ${data.game}.`, embeds: [], components: [] })
            await delay(3000)
            await message.delete()
          } else {
            await message.editReply({ content: `<@${data.inviter.id}>, ${data.invited.displayName} declined your invite to play ${data.game}.`, embeds: [], components: [] })
            await delay(3000)
            await message.deleteReply()
          }
          collector.stop()
        }
      } else {
        if (i.customId === `accept-${data.game.toLowerCase()}-invite` || i.customId === `decline-${data.game.toLowerCase()}-invite`) {
          await i.reply({ content: 'This invite is not for you!', ephemeral: true })
        }
      }
    })

    collector.on('end', async () => {
      if (!inviteResponded) {
        if (message instanceof Message) {
          await message.edit({ content: `<@${data.inviter.id}>, ${data.invited.displayName} didn't respond to the invite in time.`, embeds: [], components: [] })
          await delay(3000)
          await message.delete()
        } else {
          await message.editReply({ content: `<@${data.inviter.id}>, ${data.invited.displayName} didn't respond to the invite in time.`, embeds: [], components: [] })
          await delay(3000)
          await message.deleteReply()
        }
      }
    })
  } catch (error) {
    console.error('Error while executing sendInvite command.', error)
  }
}

type InviteCallBack = (...args: string[]) => any

const invitesManager = {
  makeInvite, sendInvite
}

export default invitesManager

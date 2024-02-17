import { Command } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../../lib/alerts/alerts'
import { addMinutes, getUnixTime } from 'date-fns'

export class HangmanCommand extends Command {
  public constructor (context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'hangman',
      description: 'Play hangman with another player.',
      cooldownDelay: 15000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .setDMPermission(false)
        .addUserOption((option) =>
          option
            .setName('player')
            .setDescription('The player you want to play with.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('word')
            .setDescription('The word you want to them to guess.')
            .setRequired(true)
            .setMaxLength(15)
            .setMinLength(3)
        )
    , {
      idHints: ['1206068859354873896']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Matches letters from a-z only
    const onlyLettersRegex = /^[a-zA-Z]+$/
    const input = interaction.options.getString('word', true)
    if (!onlyLettersRegex.test(input)) {
      return await Alerts.WARN(interaction, 'You can only enter letters for the word. (a-z)', true)
    }
    const player = interaction.options.getUser('player', true)
    // if (player.id === interaction.user.id) return await Alerts.WARN(interaction, 'You cannot play hangman with yourself!\n\nInvite another player!', true)
    if (player.bot) return await Alerts.WARN(interaction, 'You can\'t play hangman with a bot!\n\nInvite a human player!', true)

    const word = input.toLowerCase()
    const fiveMinutesInTheFuture = getUnixTime(addMinutes(Date.now(), 5))

    const invite = this.makeInvite(interaction.user.id, player.displayName, fiveMinutesInTheFuture)

    return await interaction.reply(invite)

    return await interaction.reply(`**${player.tag}** is playing hangman!`)
  }

  private makeInvite (inviter: string, invited: string, timestamp: number) {
    const hangmanEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Hangman Invite')
      .setDescription(`**${invited}**, **<@${inviter}>** has invited you to play hangman!\n\n**Accept invite?**\n\nInvite expires <t:${timestamp}:R>`)

    const acceptButton = new ButtonBuilder()
      .setCustomId('accept-hangman-invite')
      .setLabel('Accept')
      .setStyle(ButtonStyle.Success)

    const declineButton = new ButtonBuilder()
      .setCustomId('decline-hangman-invite')
      .setLabel('Decline')
      .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton)
    return { embeds: [hangmanEmbed], components: [row] }
  }
}

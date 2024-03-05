import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction } from 'discord.js'
import Alerts from '../../../lib/alerts/alerts'
import { addMinutes, getUnixTime } from 'date-fns'
import invitesManager from '../../../lib/games/invitesManager'
import { type InviteData } from '../../../lib/interface/gameInvite'
import ticTacToeHumanController from '../../../lib/games/ticTacToeHumanController'
import ticTacToeAiController from '../../../lib/games/ticTacToeAiController'

export class TicTacToeCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'tictactoe',
      description: 'Play a game of tic-tac-toe with another player (or with me).',
      cooldownDelay: 30000
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
    , {
      idHints: ['1214409088130088960']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    // Check if invited player is human or is the bot
    const invited = interaction.options.getUser('player', true)
    if (invited.bot) {
      return await Alerts.WARN(interaction, 'You can\'t play tic-tac-toe with a bot!', true)
    }

    // Check if player is themselves
    if (invited.id === interaction.user.id) return await Alerts.WARN(interaction, 'You can\'t play tic-tac-toe with yourself!\n\nInvite another player (or me)!', true)

    if (!invited.bot) {
    // If invited player is a human player, send invite
      const twoMinutesInTheFuture = getUnixTime(addMinutes(Date.now(), 2))
      const inviteData: InviteData = { inviter: interaction.user, invited, timestamp: twoMinutesInTheFuture, game: 'Tic-Tac-Toe' }
      const inviteEmbed = invitesManager.makeInvite(inviteData)
      await invitesManager.sendInvite(inviteEmbed,
        inviteData,
        interaction,
        // Start human game when invite is accepted
        async () => { await ticTacToeHumanController.startGame(inviteData.invited, interaction) }
      )
    } else {
      // If sent to the bot, start AI game (unimplemented yet)
      await ticTacToeAiController.startGame(interaction)
    }
  }
}

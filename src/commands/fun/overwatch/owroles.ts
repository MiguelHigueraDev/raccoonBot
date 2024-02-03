import { Command } from '@sapphire/framework'
import { type ChatInputCommandInteraction } from 'discord.js'
import { shuffleArray } from '../../../lib/random/shuffleUtils'
import OverwatchHeroes from '../../../constants/fun/overwatch/heroes'
import Alerts from '../../../lib/alerts/alerts'

export class OwRolesCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'owroles',
      description: 'Give a random role to a list of Overwatch players.'
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('players')
            .setDescription('Comma-separated list of players.')
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('dps')
            .setDescription('(OPTIONAL) Amount of DPS roles to assign')
            .setRequired(false)
            .addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }))
        .addStringOption((option) =>
          option
            .setName('support')
            .setDescription('(OPTIONAL) Amount of Support roles to assign')
            .setRequired(false)
            .addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }))
        .addStringOption((option) =>
          option
            .setName('tank')
            .setDescription('(OPTIONAL) Amount of Tank roles to assign')
            .setRequired(false)
            .addChoices({ name: '1', value: '1' }))
        .addBooleanOption((option) =>
          option
            .setName('assignhero')
            .setDescription('(OPTIONAL) Assign a hero to each player')
            .setRequired(false)), {
      idHints: ['1203377500546138142', '1203384542820311081']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const players = interaction.options.getString('players')
    const assignHero = interaction.options.getBoolean('assignhero') ?? false
    const dpsHeroes = shuffleArray(OverwatchHeroes.DPS_HEROES)
    const supportHeroes = shuffleArray(OverwatchHeroes.SUPPORT_HEROES)
    const tankHeroes = shuffleArray(OverwatchHeroes.TANK_HEROES)

    // Convert list to array and remove all whitespace
    if (players == null) return
    const playersArray = players.split(',').map((player) => player.trim())
    if (playersArray.length < 2 || playersArray.length > 5) {
      return await Alerts.WARN(interaction, 'Please provide between 2 and 5 players separated by commas.', true)
    }

    // Check if there are duplicate players
    if (new Set(playersArray).size !== playersArray.length) {
      return await Alerts.WARN(interaction, 'Cannot enter duplicate names. Please try again.', true)
    }

    const shuffledArray = shuffleArray(playersArray)

    // Get all role counts
    let dpsAmount: number = Number(interaction.options.getString?.('dps')) ?? 0
    let healerAmount: number = Number(interaction.options.getString?.('support')) ?? 0
    let tankAmount: number = Number(interaction.options.getString?.('tanks')) ?? 0
    const totalAmount = dpsAmount + healerAmount + tankAmount

    // If there are more players than available total roles, add slots to roles until they
    // equal the amount of players
    if (totalAmount < shuffledArray.length) {
      const roleLimits = { dps: 2, healer: 2, tank: 1 }
      let difference = shuffledArray.length - totalAmount
      while (difference > 0) {
        const randNumber = Math.ceil(Math.random() * 3)
        switch (randNumber) {
          case 1:
            if (dpsAmount < roleLimits.dps) {
              dpsAmount++
              difference--
            }
            break
          case 2:
            if (healerAmount < roleLimits.healer) {
              healerAmount++
              difference--
            }
            break
          case 3:
            if (tankAmount < roleLimits.tank) {
              tankAmount++
              difference--
            }
        }
      }
    }

    // Store all players in their respective roles
    const roles = new Map()
    while (dpsAmount !== 0 || healerAmount !== 0 || tankAmount !== 0) {
      if (dpsAmount > 0) {
        dpsAmount--
        roles.set(shuffledArray.pop(), ['dps', dpsHeroes.pop()])
      }
      if (healerAmount > 0) {
        healerAmount--
        roles.set(shuffledArray.pop(), ['healer', supportHeroes.pop()])
      }
      if (tankAmount > 0) {
        tankAmount--
        roles.set(shuffledArray.pop(), ['tank', tankHeroes.pop()])
      }
    }

    let dpsString = ':gun: DPS: '
    let healerString = ':olive: Support: '
    let tankString = ':shield: Tank: '
    roles.forEach((role, player) => {
      if (player == null) return // Return in case of undefined players (players < roles)
      switch (role[0]) {
        case 'dps':
          dpsString += (assignHero) ? ` \`${player} (${role[1][0]})\` ` : ` \`${player}\` `
          break
        case 'healer':
          healerString += (assignHero) ? ` \`${player} (${role[1][0]})\` ` : ` \`${player}\` `
          break
        case 'tank':
          tankString += (assignHero) ? ` \`${player} (${role[1][0]})\` ` : ` \`${player}\` `
      }
    })

    return await interaction.reply(`${(dpsString === ':gun: DPS: ') ? '' : dpsString}\n${(healerString === ':olive: Support: ') ? '' : healerString}\n${(tankString === ':shield: Tank: ') ? '' : tankString}`)
  }
}

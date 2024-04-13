import { Command } from '@sapphire/framework'
import { AttachmentBuilder, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import OverwatchHeroes from '../../../constants/fun/overwatch/heroes'
import { shuffleArray } from '../../../lib/random/shuffleUtils'

export class OwHeroCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'owhero',
      description: 'Get a random Overwatch hero. Can specify role.',
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
            .setName('role')
            .setDescription('(OPTIONAL) Specify the role you want to get.')
            .setRequired(false)
            .addChoices({ name: 'DPS', value: 'dps' }, { name: 'Support', value: 'support' }, { name: 'Tank', value: 'tank' }))
    )
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const chosenRole = interaction.options.getString('role') ?? 'notSpecified'

    let chosenHero: string[]
    if (chosenRole === 'notSpecified') {
      const allHeroes = [...OverwatchHeroes.DPS_HEROES, ...OverwatchHeroes.SUPPORT_HEROES, ...OverwatchHeroes.TANK_HEROES]
      chosenHero = shuffleArray(allHeroes)[0]
    } else if (chosenRole === 'dps') {
      chosenHero = shuffleArray(OverwatchHeroes.DPS_HEROES)[0]
    } else if (chosenRole === 'support') {
      chosenHero = shuffleArray(OverwatchHeroes.SUPPORT_HEROES)[0]
    } else {
      chosenHero = shuffleArray(OverwatchHeroes.TANK_HEROES)[0]
    }

    const [heroName, heroUrl] = chosenHero

    const heroImage = new AttachmentBuilder('../assets/overwatchHeroes/' + heroUrl)

    const heroEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(heroName)
      .setImage('attachment://' + heroUrl)

    return await interaction.reply({ embeds: [heroEmbed], files: [heroImage] })
  }
}

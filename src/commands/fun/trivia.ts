import { Command } from '@sapphire/framework'
import TRIVIA_CATEGORIES from '../../constants/externalApis/openTdb'
import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import Alerts from '../../lib/alerts/alerts'
import { shuffleArray } from '../../lib/random/shuffleUtils'
import he from 'he'

export class TriviaCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'trivia',
      description: 'Play a game of trivia!'
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('(OPTIONAL) Specify a category')
            .addChoices(...TRIVIA_CATEGORIES)
        )
    , {
      idHints: ['1200881899577561258', '1203384541159493653']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    if (interaction.guild == null || interaction.channel == null) return await Alerts.ERROR(interaction, 'This command can only be used in a server channel.', true)
    // First check if there is already a trivia running in this channel
    if (this.container.trivias.includes(`${interaction.guild.id}:${interaction.channel.id}`)) {
      return await Alerts.ERROR(interaction, 'There is already a trivia running in this channel.', true)
    }

    // Get category if chosen
    const chosenCategory = interaction.options.getString('category')
    let triviaUrl = 'https://opentdb.com/api.php?amount=1&type=multiple'
    if (chosenCategory != null) {
      triviaUrl = `https://opentdb.com/api.php?amount=1&category=${chosenCategory}&type=multiple`
    }

    // Fetch question from API
    const response = await fetch(triviaUrl)
    if (!response.ok) await Alerts.ERROR(interaction, 'There was an error while fetching data from the API.', true)
    const json = await response.json()
    const questionInfo: { question: string, category: string, correct_answer: string, incorrect_answers: string[] } = json.results[0]

    // Replace all HTML character entities with valid text
    const question: string = he.decode(questionInfo.question)
    const category: string = he.decode(questionInfo.category)
    const correctAnswer: string = he.decode(questionInfo.correct_answer)
    const incorrectAnswers: string[] = questionInfo.incorrect_answers.map((answer: string) => he.decode(answer))

    // Put the answers in a formatted string in a random order
    const answers = shuffleArray([...incorrectAnswers, correctAnswer])
    const correctAnswerIndex = answers.indexOf(correctAnswer)
    let formattedAnswers = ''
    for (let i = 1; i < 5; i++) {
      formattedAnswers += i + '. ' + answers.shift() + '\n'
    }
    formattedAnswers += '**Answer in the chat with the answer number!**'

    // Display embed
    const questionEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(question)
      .setAuthor({ name: `Category: ${category}` })
      .setDescription(formattedAnswers)
      .setFooter({ text: 'Questions obtained from https://opentdb.com/' }
      )

    // Save current guild and channel to prevent multiple trivias in the same channel
    this.container.trivias.push(`${interaction.guild.id}:${interaction.channel.id}`)
    let answered = false
    const participants: string[] = []
    const collector = interaction.channel.createMessageCollector({ time: 15_000 })

    collector.on('collect', async (message): Promise<any> => {
      if (message.author.bot) return
      if (parseInt(message.content) !== 1 && parseInt(message.content) !== 2 && parseInt(message.content) !== 3 && parseInt(message.content) !== 4) return

      if (participants.includes(message.author.id)) {
        return await interaction.followUp(`<@${message.author.id}>, you can't answer again!`)
      }

      if (parseInt(message.content) === correctAnswerIndex + 1) {
        answered = true
        collector.stop()
        await interaction.followUp(`<@${message.author.id}> got the correct answer (**${correctAnswer}**)!`)
        return await interaction.editReply({ content: `**Trivia ended!** Winner: <@${message.author.id}>`, embeds: [] })
      } else {
        participants.push(message.author.id)
        return await interaction.followUp(`<@${message.author.id}>, sadly, that is incorrect!`)
      }
    })

    collector.on('end', async (): Promise<any> => {
      this.container.trivias = this.container.trivias.filter(trivia => trivia !== `${interaction.guild?.id}:${interaction.channel?.id}`)
      if (!answered) {
        return await interaction.editReply({ content: `It seems like no one got the correct answer :( It was **${correctAnswer}**`, embeds: [] })
      }
    })

    await interaction.reply({ embeds: [questionEmbed], fetchReply: true })
  }
}

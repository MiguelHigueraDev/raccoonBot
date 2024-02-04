import { InteractionHandler, InteractionHandlerTypes, container } from '@sapphire/framework'
import { EmbedBuilder, type ButtonInteraction } from 'discord.js'
import pollHandler from '../lib/database/pollHandler'
import StringAlerts from '../lib/alerts/stringAlerts'
import { emojiMap } from '../commands/utility/poll'

export class PollButtonsHandler extends InteractionHandler {
  public constructor (context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(context, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Button
    })
  }

  public override parse (interaction: ButtonInteraction) {
    if (interaction.customId !== 'pollOption1' && interaction.customId !== 'pollOption2' && interaction.customId !== 'pollOption3' && interaction.customId !== 'pollOption4' && interaction.customId !== 'pollOption5' && interaction.customId !== 'pollOption6' && interaction.customId !== 'pollOption7' && interaction.customId !== 'pollOption8') return this.none()
    return this.some()
  }

  public async run (interaction: ButtonInteraction) {
    // Get ID from embed footer
    const embed = interaction.message.embeds[0]
    if (embed.footer == null) return
    const footer = embed.footer.text
    const match = footer.match(/\d+/)
    if (match === null) return
    const pollId = parseInt(match[0], 10)

    // Check if the poll has expired
    if (await pollHandler.checkIfPollExpired(pollId) === true) {
      return await interaction.user.send(StringAlerts.ERROR('You can\'t vote, this poll has expired.'))
    }

    // Get Option number from button custom ID
    const optionNumber = Number(interaction.customId.substring('pollOption'.length))
    // Replace the emojis at the start with an empty string
    const optionText = embed.fields[optionNumber - 1].name.replace(/:(one|two|three|four|five|six|seven|eight): /g, '')
    // Finally get the optionId
    const optionId: number = await pollHandler.getOptionId(pollId, optionText)

    if (optionId == null) return await interaction.user.send(StringAlerts.ERROR('Error fetching poll data.'))

    const checkAlreadyVoted = await pollHandler.checkIfUserVoted(pollId, interaction.user.id)
    if (checkAlreadyVoted === true) {
      await interaction.user.send(StringAlerts.WARN('You have already voted in this poll.'))
    } else {
      // Add vote
      await pollHandler.addVote(pollId, interaction.user.id, optionId)
    }

    // Get votes and extra info
    const votes: VoteObject[] = await pollHandler.getVotes(pollId)
    if (votes == null) return await interaction.user.send(StringAlerts.ERROR('Error fetching poll data.'))
    const totalVotes: number = votes.reduce((total, vote) => Number(total) + Number(vote.voteCount), 0)
    const creatorId: string = votes[0].userId
    const expirationDate: Date = votes[0].expirationDate

    // Get question from votes array
    const question = votes[0].question
    // Update embed and vote count
    const pollEmbed = await getPollEmbed(pollId, question, totalVotes, votes, creatorId, expirationDate)
    await interaction.update({ embeds: [pollEmbed] })
  }
}

const getPollEmbed = async (pollId: number, question: string, total: number, votes: VoteObject[], creatorId: string, expirationDate: Date) => {
  // Get creator data
  const creator = await container.client.users.fetch(creatorId)
  const expirationDateUnix = Math.floor(expirationDate.getTime() / 1000)
  const pollEmbed = new EmbedBuilder()
    .setColor('Blurple')
    .setTitle(question)
    .setFooter({ text: `ID: ${pollId}`, iconURL: creator.displayAvatarURL() })

  // Add options
  for (let i = 0; i < votes.length; i++) {
    const emoji = emojiMap[i + 1]
    pollEmbed.addFields({ name: `${emoji} ${votes[i].optionText}`, value: `${Number(votes[i].voteCount)} votes (${Math.round((Number(votes[i].voteCount) / Number(total)) * 100)}%)` })
  }
  pollEmbed.addFields({ name: `Poll created by: ${creator.displayName}.`, value: `Expires <t:${expirationDateUnix}:R>` })
  return pollEmbed
}

export interface VoteObject {
  question: string
  userId: string
  expirationDate: Date
  optionId: number
  optionText: string
  voteCount: number
}

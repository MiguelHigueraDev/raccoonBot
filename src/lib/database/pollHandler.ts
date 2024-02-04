import { container } from '@sapphire/framework'
import userHandler from './userHandler'

const createPoll = async (userId: string, options: string[], question: string, expirationDate: Date) => {
  try {
    const user = await userHandler.updateUserStatus(userId)
    if (!user) return false
    const poll = await container.db.poll.create({
      data: {
        userId,
        expirationDate,
        question
      }
    })
    for (const option of options) {
      await container.db.pollOption.create({
        data: {
          pollId: poll.id,
          text: option
        }
      })
    }
    return poll.id
  } catch (error) {
    console.error(error)
    return false
  }
}

const getOptionId = async (pollId: number, optionText: string) => {
  try {
    const option = await container.db.pollOption.findFirst({
      where: {
        pollId,
        text: optionText
      }
    })
    return option?.id
  } catch (error) {
    console.error(error)
    return null
  }
}

const checkIfUserVoted = async (pollId: number, userId: string) => {
  try {
    const foundVote = await container.db.pollVote.findFirst({
      where: {
        pollId,
        userId
      }
    })
    return foundVote !== null
  } catch (error) {
    console.error(error)
    return null
  }
}

const addVote = async (pollId: number, userId: string, optionId: number) => {
  try {
    await container.db.pollVote.create({
      data: {
        pollId,
        userId,
        optionId
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const getVotes = async (pollId: number) => {
  try {
    const votes = await container.db.$queryRaw`
    SELECT
    p.question AS question,
    p.userId as userId,
    p.expirationDate as expirationDate,
    po.id AS optionId,
    po.text AS optionText,
    COUNT(pv.id) AS voteCount
    FROM
      PollOption po
      LEFT JOIN PollVote pv ON po.id = pv.optionId
      LEFT JOIN Poll p ON po.pollId = p.id
    WHERE
      po.pollId = ${pollId}
    GROUP BY
      po.id, po.text;
    `
    return votes
  } catch (error) {
    console.error(error)
    return null
  }
}

const pollHandler = {
  createPoll, getOptionId, checkIfUserVoted, addVote, getVotes
}

export default pollHandler

import { container } from '@sapphire/framework'

const updateUserStatus = async (userId: string): Promise<boolean> => {
  try {
    const foundUser = await container.db.user.findFirst({ where: { id: userId } })
    const username = (await container.client.users.fetch(userId)).username
    if (foundUser === null) {
      await container.db.user.create({
        data: {
          id: userId,
          username
        }
      })
    } else {
      await container.db.user.update({
        where: {
          id: userId
        },
        data: {
          username
        }
      })
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const updateGuildUserStatus = async (userId: string, guildId: string): Promise<boolean> => {
  try {
    const foundGuildUser = await container.db.guildUser.findFirst({ where: { userId, guildId } })
    if (foundGuildUser === null) {
      await container.db.guildUser.create({
        data: {
          userId,
          guildId
        }
      })
    }
    return true
  } catch (error) {
    console.error('Error updating GuildUser status', error)
    return false
  }
}

const userHandler = {
  updateUserStatus, updateGuildUserStatus
}

export default userHandler

import { container } from '@sapphire/framework'

/**
 * Updates the status of a guild in the database or creates a new entry if it doesn't exist.
 *
 * @param {string} guildId - The ID of the guild to update or create.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the update or creation is successful, and false otherwise.
 * @throws {Error} - Throws an error if there's an issue during the database operation.
 */
const updateGuildStatus = async (guildId: string): Promise<boolean> => {
  try {
    const foundGuild = await container.db.guild.findFirst({ where: { id: guildId } })
    const guildName = (await container.client.guilds.fetch(guildId)).name
    if (foundGuild === null) {
      // Store the guild, it doesn't exist in the database
      await container.db.guild.create({
        data: {
          id: guildId,
          name: guildName
        }
      })
    } else {
      // Update name
      await container.db.guild.update({
        where: {
          id: guildId
        },
        data: {
          name: guildName
        }
      })
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const guildHandler = {
  updateGuildStatus
}

export default guildHandler

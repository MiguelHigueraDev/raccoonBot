import { container } from '@sapphire/framework'
import { scheduleJob } from 'node-schedule'
import userHandler from '../lib/database/userHandler'
import guildHandler from '../lib/database/guildHandler'

const updateGuildUsers = () => {
  scheduleJob('*/5 * * * *', async () => {
    try {
      const guilds = await container.client.guilds.fetch()
      for (const guild of guilds) {
        const guildObject = guild[1].fetch()
        const guildId = guild[1].id
        // Make sure guild is updated before users
        await guildHandler.updateGuildStatus(guildId)
        const members = (await guildObject).members.cache
        for (const [memberId, member] of members) {
          if (!member.user.bot) {
            await userHandler.updateUserStatus(memberId)
            // Update GuildUser as well for all guilds the member is in
            await userHandler.updateGuildUserStatus(memberId, guildId)
          }
        }
      }
    } catch (error) {
      console.error('Error updating guild users:', error)
    }
  })
}

export default updateGuildUsers

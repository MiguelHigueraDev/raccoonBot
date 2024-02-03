import { container } from '@sapphire/framework'

import { addHours, getDate, getMonth } from 'date-fns'
import { scheduleJob } from 'node-schedule'
import settingsHandler from '../lib/database/settingsHandler'
import { Settings } from '../constants/bot-config/settings'
import { checkChannelPermissions } from '../lib/permissions/checkPermissions'

const birthdaySchedule = () => {
  scheduleJob('0 6 * * *', async () => {
    // Fetch all users with all their user preferences
    // If the user has their birthday set to current day, and preference is enabled, send birthday message to channels
    const elegibleUsers: ElegibleUsers[] = await container.db.$queryRaw`
    SELECT u.id as userId, g.id as guildId, u.birthday
    FROM User u
    JOIN GuildUser gu ON u.id = gu.userId
    JOIN Guild g ON gu.guildId = g.id
    JOIN GuildModules gm ON gu.guildId = gm.guildId
    JOIN UserPreferences up ON u.id = up.userId
    WHERE gm.moduleId = 2
      AND gm.enabled = 1
      AND up.preferenceId = 1
      AND up.enabled = 1
      AND up.guildId = gm.guildId;
    `

    for (const user of elegibleUsers) {
      let birthday = user.birthday
      // Add hours to account for timezone differences
      birthday = addHours(birthday, 6)
      let day = getDate(birthday)
      let month = getMonth(birthday)

      // Handle leap birthdays
      if (month === 1 && day === 29) {
        birthday = addHours(birthday, 16)
        day = getDate(birthday)
        month = getMonth(birthday)
      }

      const today = new Date()
      const currentDay = getDate(today)
      const currentMonth = getMonth(today)

      if (currentDay === day && currentMonth === month) {
        const sent = await sendBirthdayMessage(user.guildId, user.userId)
        if (sent === false) console.log('Error sending birthday message to ' + user.userId + ' in guild ' + user.guildId)
      }
    }
  })
}

const sendBirthdayMessage = async (guildId: string, userId: string) => {
  console.log('Sending birthday message for ' + userId + ' in guild ' + guildId)
  try {
    if (container.client.user == null) return false
    // Get main channel from server preferences and send text message to it
    const mainChannel = await settingsHandler.fetchSetting(guildId, Settings.mainchannel)
    if (mainChannel != null) {
      const channel = container.client.channels.cache.get(mainChannel)
      if (channel != null && channel.isTextBased()) {
        if (await checkChannelPermissions(guildId, container.client.user.id, channel.id)) {
          return await channel.send(`Today is **<@${userId}>**'s birthday! Happy birthday! :tada:`)
        }
      }
    }

    // Send message to first available text channel if there isn't a main channel or bot doesn't have permissions
    const channels = (await (container.client.guilds.fetch(guildId))).channels.cache.filter((ch) => ch.isTextBased() && !ch.isVoiceBased() && !ch.isThread() && !ch.isThreadOnly())
    for (const ch of channels) {
      const channel = ch[1]
      if (channel == null) continue
      if (channel.isTextBased()) {
        if (await checkChannelPermissions(guildId, container.client.user.id, channel.id)) {
          return await channel.send(`Today is <@${userId}>'s birthday! **Happy birthday!** :tada:`)
        }
      }
    }
    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

interface ElegibleUsers {
  userId: string
  guildId: string
  birthday: Date
}

export default birthdaySchedule

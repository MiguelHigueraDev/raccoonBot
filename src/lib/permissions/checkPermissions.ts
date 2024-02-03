import { container } from '@sapphire/framework'
import { type Guild } from 'discord.js'

/**
 * Checks if a user in a guild has administrator permissions.
 *
 * @param {Guild} guild - The Discord guild (server) where the user's permissions are checked.
 * @param {string} userId - The ID of the user whose administrator permissions are being checked.
 * @returns {Promise<boolean>} - A Promise that resolves to `true` if the user has administrator permissions, otherwise `false`.
 *
 */
export const checkIfUserIsGuildAdmin = async (guild: Guild, userId: string): Promise<boolean> => {
  const guildMember = await guild.members.fetch(userId)
  const permissions = guildMember.permissions
  return permissions.has('Administrator')
}

/**
 * Checks if a user has the required permissions to send messages to a specific channel.
 *
 * @param {string} guildId - The ID of the guild (server) where the channel belongs.
 * @param {string} userId - The ID of the user whose permissions are being checked.
 * @param {string} channelId - The ID of the channel where permissions are checked.
 * @returns {Promise<boolean>} - A Promise that resolves to `true` if the user has required permissions, otherwise `false`.
 * @throws {Error} - Throws an error if any Discord API call fails.
 *
 */
export const checkChannelPermissions = async (guildId: string, userId: string, channelId: string): Promise<boolean> => {
  try {
    // Fetch the guild, guild member, and channel
    const guild = await container.client.guilds.fetch(guildId)
    const guildMember = await guild.members.fetch(userId)
    const channel = await guild.channels.fetch(channelId)

    // Check if the channel exists
    if (channel == null) {
      return false
    }

    // Check specific permissions (ViewChannel and SendMessages)
    const hasViewChannelPermission = channel.permissionsFor(guildMember, true).has('ViewChannel')
    const hasSendMessagesPermission = channel.permissionsFor(guildMember, true).has('SendMessages')

    return hasViewChannelPermission && hasSendMessagesPermission
  } catch (error) {
    // Handle errors
    console.error('Error checking channel permissions:', error)
    throw error
  }
}

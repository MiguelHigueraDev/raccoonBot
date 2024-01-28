import { type Guild } from 'discord.js'

export const checkIfUserIsGuildAdmin = async (guild: Guild, userId: string): Promise<boolean> => {
  const guildMember = await guild.members.fetch(userId)
  const permissions = guildMember.permissions
  return permissions.has('Administrator')
}

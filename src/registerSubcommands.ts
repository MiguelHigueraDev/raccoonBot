import { ApplicationCommandRegistries } from '@sapphire/framework'
import settingsHandler from './lib/database/settingsHandler'
import { ChannelType, SlashCommandBuilder } from 'discord.js'

export const registerSubcommands = async () => {
  const registry = ApplicationCommandRegistries.acquire('setting')
  // Fetch settings from database
  const allSettings = await settingsHandler.fetchSettings()
  // No settings found
  if (allSettings === false) throw new Error('No settings found')
  const command = new SlashCommandBuilder().setName('setting').setDescription('[SERVER ADMIN ONLY] Edit server settings')
  for (const setting of allSettings as SubcommandSettings[]) {
    if (setting.type === 'channel') {
      command.addSubcommand(command => command
        .setName(setting.commandName)
        .setDescription(setting.commandDescription)
        .addChannelOption(option => option
          .setName(setting.optionName)
          .addChannelTypes(ChannelType.GuildText)
          .setDescription(setting.optionDescription)
          .setRequired(true))
      )
    }
    // Todo: more types
  }
  registry.registerChatInputCommand(command)
}

export interface SubcommandSettings {
  type: string
  name: string
  typeSettings: string
  commandName: string
  commandDescription: string
  commandPlaceholder: string
  optionName: string
  optionDescription: string
}

import { SapphireClient } from '@sapphire/framework'
import { GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
config()

const token = process.env.BOT_TOKEN

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences],
  loadMessageCommandListeners: true
})
client.login(token).catch((error) => { console.log('The bot crashed.\n' + error) })

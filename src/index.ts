import { PrismaClient } from '@prisma/client'
import { SapphireClient, container } from '@sapphire/framework'
import { GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
config()

const token = process.env.BOT_TOKEN

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences],
  loadMessageCommandListeners: true
})

// Database init
const prisma = new PrismaClient()

// Stores
declare module '@sapphire/pieces' {
  interface Container {
    trivias: string[]
    db: PrismaClient
  }
}

container.trivias = []
container.db = prisma

client.login(token).catch((error) => { console.log('The bot has crashed.\n' + error) })

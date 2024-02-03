import { PrismaClient } from '@prisma/client'
import { SapphireClient, container } from '@sapphire/framework'
import { GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import birthdaySchedule from './schedules/birthday'
import updateGuildUsers from './schedules/updateGuildUsers'
config()

const token = process.env.BOT_TOKEN

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
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

// Schedules
function loadSchedules (): void {
  birthdaySchedule()
  updateGuildUsers()
}

container.trivias = []
container.db = prisma

client.login(token)
  .then(() => { loadSchedules() })
  .catch((error) => { console.log('The bot has crashed.\n' + error) })

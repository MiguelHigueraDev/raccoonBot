import { PrismaClient } from '@prisma/client'
import { SapphireClient, container } from '@sapphire/framework'
import { ActivityType, GatewayIntentBits } from 'discord.js'
import { config } from 'dotenv'
import { registerSubcommands } from './registerSubcommands'
import birthdaySchedule from './schedules/birthday'
import updateGuildUsers from './schedules/updateGuildUsers'
config()

const token = process.env.BOT_TOKEN

const client = new SapphireClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
  loadMessageCommandListeners: true,
  presence: {
    activities: [{
      name: 'raccoonbot.vercel.app',
      type: ActivityType.Watching
    }]
  }
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

// Register option subcommands
/* registerSubcommands()
  .then(() => { console.log('Subcommands updated.') })
  .catch((error) => { console.log(error) }) */

client.login(token)
  .then(() => { loadSchedules() })
  .catch((error) => { console.log('The bot has crashed.\n' + error) })

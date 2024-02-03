import { Command } from '@sapphire/framework'
import { isMessageInstance } from '@sapphire/discord.js-utilities'
import type { ChatInputCommandInteraction, Message } from 'discord.js'

export class PingCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'ping',
      aliases: ['pong'],
      description: 'ping pong'
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder.setName('ping').setDescription('Ping bot to see if it\'s alive')
    , {
      idHints: ['1200846682422776008', '1203384624718422037']
    })
  }

  public async messageRun (message: Message): Promise<Message> {
    const msg = await message.channel.send('Ping!?')
    const content = `Pong from TypeScript! Bot latency ${Math.round(this.container.client.ws.ping)}ms. API Latency ${msg.createdTimestamp - message.createdTimestamp}`
    return await msg.edit(content)
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction): Promise<Message> {
    const msg = await interaction.reply({ content: 'Ping?!', ephemeral: true, fetchReply: true })

    if (isMessageInstance(msg)) {
      const diff = msg.createdTimestamp - interaction.createdTimestamp
      const ping = Math.round(this.container.client.ws.ping)
      return await interaction.editReply(`Pong! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`)
    }

    return await interaction.editReply('Failed to retrieve ping :(')
  }
}

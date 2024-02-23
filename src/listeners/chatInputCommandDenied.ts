import { type Events, Listener, type UserError, type ChatInputCommandDeniedPayload } from '@sapphire/framework'

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
  public async run (error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply({
        content: error.message
      })
    }

    return await interaction.reply({
      content: error.message,
      ephemeral: true
    })
  }
}

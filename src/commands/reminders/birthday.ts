import { Command } from '@sapphire/framework'
import DateFormatter from '../../lib/formatting/dateFormatter'
import Alerts from '../../lib/alerts/alerts'
import { addYears, differenceInYears, getUnixTime } from 'date-fns'
import { type ChatInputCommandInteraction, time, ButtonBuilder, ButtonStyle, ActionRowBuilder, type MessageActionRowComponentBuilder } from 'discord.js'

export class BirthdayCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'birthday',
      description: 'Save your birthday so people get notified of it!'
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('birthdate')
            .setDescription('Date in yyyy-mm-dd format, example: February 22nd, 1980 would be 1980-02-22 or 1980/02/22')
            .setMaxLength(10)
            .setMinLength(3)
        ), {
      idHints: ['1201314473579921577', '1203384457843966002']
    }
    )
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const birthdate = interaction.options.getString('birthdate')
    const userId = interaction.user.id
    const username = interaction.user.username
    const user = await this.container.db.user.findUnique({ where: { id: userId } })
    try {
    // If user is not stored, store it
      if (user === null) {
        await this.container.db.user.create({
          data: {
            id: userId,
            username
          }
        })
      }
      if (birthdate === null) {
        // Only display birthday
        const birthday = await this.container.db.user.findUnique({ where: { id: userId }, select: { birthday: true } })
        if (birthday?.birthday == null) {
          return await Alerts.INFO(interaction, 'Your birthday isn\'t saved. Save it using this command and providing a date in yyyy-mm-dd format.', true)
        } else {
          return await Alerts.INFO(interaction, `Your birthday is: ${time(Math.floor(birthday.birthday.getTime() / 1000), 'D')}`, true)
        }
      }

      // Check if entered date has a valid format
      if (!DateFormatter.checkDateFormat(birthdate)) {
        return await Alerts.ERROR(interaction, 'Date has an invalid format. It must be in yyyy/mm/dd, yyyy.mm.dd, or yyyy-mm-dd format.\nExample: March 20, 2020 would be 2020/03/20.', true)
      }
      const parsedDate = DateFormatter.parseDate(birthdate)
      if (parsedDate === false) return await Alerts.ERROR(interaction, 'Date has an invalid format. It must be in yyyy/mm/dd, yyyy.mm.dd, or yyyy-mm-dd format.\nExample: March 20, 2020 would be 2020/03/20.', true)

      // Check if user is in cooldown
      if (user?.lastBirthdayChange != null) {
        const lastBirthdayChangeDate = user.lastBirthdayChange
        const yearsDifference = differenceInYears(new Date(), lastBirthdayChangeDate)
        const cooldownExpiryDate = addYears(lastBirthdayChangeDate, 1)
        if (yearsDifference < 1) {
          return await Alerts.ERROR(interaction, 'You can only set your birthday once every year.\nYou will be able to update it in: ' + time(getUnixTime(cooldownExpiryDate)), true)
        }
      }

      // Show confirmation dialog
      const buttonRow = createButtons()
      const response = await interaction.reply({
        content: `Are you sure you want to set your birthday to ${time(Math.floor(Date.parse(parsedDate) / 1000), 'D')}?\nYou won't be able to change it for a year.`,
        components: [buttonRow],
        ephemeral: true
      })

      // Wait for confirmation
      try {
        const confirmation = await response.awaitMessageComponent({ time: 30_000 })
        if (confirmation.customId === 'confirm') {
          await this.container.db.user.update({
            where: {
              id: userId
            },
            data: {
              birthday: parsedDate,
              lastBirthdayChange: new Date(),
              username
            }
          })

          const nextBirthday = DateFormatter.getNextBirthday(parsedDate)

          return await interaction.editReply({
            content: `:tada: Your birthday has been successfully saved! Next birthday: ${time(Math.floor(Date.parse(nextBirthday) / 1000), 'D')} (${time(Math.floor(Date.parse(nextBirthday)) / 1000, 'R')})\nIf this server has the \`birthday\` module enabled and you also have enabled it in your personal preferences for this server (\`/preferences\`), server members will be notified of it!`,
            components: []
          })
        } else {
          return await interaction.editReply({ content: 'Birthday update canceled.', components: [] })
        }
      } catch (e) {
        return await interaction.editReply({ content: 'Confirmation not received within 30 seconds, canceling.', components: [] })
      }
    } catch (error) {
      console.error(error)
      return await Alerts.ERROR(interaction, 'An error occurred while saving your birthday.', true)
    }
  }
}

const createButtons = (): ActionRowBuilder<MessageActionRowComponentBuilder> => {
  const confirm: MessageActionRowComponentBuilder = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Success)

  const cancel: MessageActionRowComponentBuilder = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary)

  const row = new ActionRowBuilder().addComponents(confirm, cancel)
  return row as ActionRowBuilder<MessageActionRowComponentBuilder>
}

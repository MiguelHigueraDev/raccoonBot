import { Command } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { ShowLoadingMessage } from '../../../lib/api/loadingMessage'
import { config } from 'dotenv'
import { type Keyword, type Cast, type CastResult, type TvShow, type TvShowResult, type TvShowResults, type ShowKeywordsResult } from '../../../lib/interface/tmdb'
import StringAlerts from '../../../lib/alerts/stringAlerts'
config()
const TMDB_KEY = process.env.TMDB_KEY

export class TvShowCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'tvshow',
      description: 'Get information about a TV show from The Movie Database.',
      cooldownDelay: 10000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('tvshow')
            .setDescription('The name of the show.')
            .setRequired(true)
        ), {
      idHints: ['1205308301751885844', '1205317483909611531']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const tvShow = interaction.options.getString('tvshow', true)
    const loadingMessage = await ShowLoadingMessage(interaction)
    try {
      const partialShowQuery = await fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${tvShow}&include_adult=false`)
      const partialShowQueryData: TvShowResults = await partialShowQuery.json()
      // Check if there are any results
      if (partialShowQueryData.results == null || partialShowQueryData.results.length < 1) {
        const msgStillExists = await interaction.channel?.messages.fetch(loadingMessage.id).catch(() => null)
        if (msgStillExists == null) return
        return await loadingMessage.edit({
          content: StringAlerts.WARN('Show not found.'),
          embeds: []
        })
      }

      const partialShowJson: TvShowResult = partialShowQueryData.results[0]
      const id = partialShowJson.id
      // Now fetch more data about the show
      const fullShowQuery = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}`)
      const fullShowData: TvShow = await fullShowQuery.json()
      const {
        original_name: originalName, name: showName, overview: showSynopsis,
        first_air_date: firstAirDate, last_air_date: lastAirDate, genres,
        poster_path: poster, number_of_seasons: numberOfSeasons,
        number_of_episodes: numberOfEpisodes, in_production: inProduction,
        status
      } = fullShowData

      // Format show data
      let finalTitle = ''
      if (originalName === showName) {
        finalTitle = showName
      } else {
        finalTitle = `${showName} (${originalName})`
      }
      const genreString = genres.map((genre) => genre.name).join(', ')

      const firstAirYear = firstAirDate.substring(0, 4)
      let lastAirYear = lastAirDate.substring(0, 4)
      if (inProduction) lastAirYear = ''

      // Fetch cast
      const castQuery = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits?api_key=${TMDB_KEY}`)
      const castData: CastResult = await castQuery.json()
      const selectedCast: Cast[] = castData.cast.slice(0, 7)
      const castString = selectedCast.map((actor) => actor.name).join(', ')

      // Fetch keywords
      const keywordsQuery = await fetch(`https://api.themoviedb.org/3/tv/${id}/keywords?api_key=${TMDB_KEY}`)
      const keywordsData: ShowKeywordsResult = await keywordsQuery.json()
      const selectedKeywords: Keyword[] = keywordsData.results.slice(0, 10)
      const keywordsString = selectedKeywords.map((keyword) => keyword.name).join(', ')

      // Make embed and button
      const embed = this.makeEmbed(finalTitle, poster, numberOfSeasons, numberOfEpisodes, status, firstAirYear, lastAirYear, genreString, showSynopsis, castString, keywordsString)
      const buttonRow = this.makeWatchButton(id)

      // Check if message was deleted to prevent crash before editing loading
      const msgStillExists = await interaction.channel?.messages.fetch(loadingMessage.id).catch(() => null)
      if (msgStillExists == null) return
      return await loadingMessage.edit({ embeds: [embed], components: [buttonRow] })
    } catch (error) {
      console.error(error)
      const msgStillExists = await interaction.channel?.messages.fetch(loadingMessage.id).catch(() => null)
      if (msgStillExists == null) return
      return await loadingMessage.edit({
        content: StringAlerts.ERROR('Error fetching data about the show.'),
        embeds: []
      })
    }
  }

  private makeEmbed (title: string, posterUrl: string, numberOfSeasons: number,
    numberOfEpisodes: number, status: string, firstAirYear: string,
    lastAirYear: string, genreString: string, showSynopsis: string,
    castString: string, keywordsString: string) {
    const showEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(title)
      .setDescription(showSynopsis)
      .setFooter({ text: 'Show information provided by The Movie Database' })
      .setThumbnail(`https://image.tmdb.org/t/p/original${posterUrl}`)
      .addFields(
        { name: 'Main Cast', value: castString },
        { name: 'Genres', value: genreString },
        { name: 'Keywords', value: keywordsString },
        { name: 'Year(s)', value: `${firstAirYear}-${lastAirYear}`, inline: true },
        { name: 'Number of seasons', value: `${numberOfSeasons}`, inline: true },
        { name: 'Number of episodes', value: `${numberOfEpisodes}`, inline: true },
        { name: 'Status', value: status, inline: true }
      )
    return showEmbed
  }

  private makeWatchButton (showId: number) {
    const button = new ButtonBuilder()
      .setLabel('Where to watch')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://www.themoviedb.org/tv/${showId}/watch`)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
    return row
  }
}

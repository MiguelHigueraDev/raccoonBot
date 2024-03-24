import { Command } from '@sapphire/framework'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { config } from 'dotenv'
import { type CastResult, type Cast, type Movie, type MovieResult, type MovieResults, type KeywordsResult, type Keyword } from '../../../lib/interface/tmdb'
import StringAlerts from '../../../lib/alerts/stringAlerts'
config()
const TMDB_KEY = process.env.TMDB_KEY

export class MovieCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'movie',
      description: 'Get information about a movie from The Movie Database.',
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
            .setName('movie')
            .setDescription('The name of the movie.')
            .setRequired(true)
        ), {
      idHints: ['1205276006420709427', '1205317481795686480']
    })
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    const movie = interaction.options.getString('movie', true)
    await interaction.deferReply()
    try {
      const partialMovieQuery = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${movie}&include_adult=false`)
      const partialMovieQueryData: MovieResults = await partialMovieQuery.json()

      if (partialMovieQueryData.results == null || partialMovieQueryData.results.length < 1) {
        return await interaction.editReply({
          content: StringAlerts.WARN('Movie not found.'),
          embeds: []
        })
      }

      const partialMovieJson: MovieResult = partialMovieQueryData.results[0]
      const id = partialMovieJson.id
      // Now fetch more data about the movie
      const fullMovieQuery = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_KEY}`)
      const fullMovieData: Movie = await fullMovieQuery.json()
      const {
        original_title: originalTitle, title: movieTitle,
        overview: movieSynopsis, release_date: releaseDate, genres,
        poster_path: posterUrl
      } = fullMovieData

      // Format movie data
      const releaseYear = releaseDate.substring(0, 4)
      const genreString = genres.map((genre) => genre.name).join(', ')
      let finalTitle = ''
      if (originalTitle === movieTitle) {
        finalTitle = movieTitle
      } else {
        finalTitle = `${movieTitle} (${originalTitle})`
      }

      // Fetch cast
      const castQuery = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${TMDB_KEY}`)
      const castData: CastResult = await castQuery.json()
      const selectedCast: Cast[] = castData.cast.slice(0, 7)
      const castString = selectedCast.map((actor) => actor.name).join(', ')

      // Fetch keywords
      const keywordsQuery = await fetch(`https://api.themoviedb.org/3/movie/${id}/keywords?api_key=${TMDB_KEY}`)
      const keywordsData: KeywordsResult = await keywordsQuery.json()
      const selectedKeywords: Keyword[] = keywordsData.keywords.slice(0, 10)
      const keywordsString = selectedKeywords.map((keyword) => keyword.name).join(', ')

      // Make embed and button
      const embed = this.makeEmbed(finalTitle, posterUrl, releaseYear, genreString, movieSynopsis, castString, keywordsString)
      const buttonRow = this.makeWatchButton(id)

      return await interaction.editReply({ embeds: [embed], components: [buttonRow] })
    } catch (error) {
      console.error(error)
      return await interaction.editReply({
        content: StringAlerts.ERROR('Error fetching data about the movie.'),
        embeds: []
      })
    }
  }

  private makeEmbed (title: string, posterUrl: string, releaseYear: string, genreString: string, movieSynopsis: string, castString: string, keywordsString: string) {
    const movieEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle(title)
      .setDescription(movieSynopsis)
      .setFooter({ text: 'Movie information provided by The Movie Database' })
      .setThumbnail(`https://image.tmdb.org/t/p/original${posterUrl}`)
      .addFields(
        { name: 'Main Cast', value: castString },
        { name: 'Genres', value: genreString },
        { name: 'Keywords', value: keywordsString },
        { name: 'Release Year', value: releaseYear }
      )
    return movieEmbed
  }

  private makeWatchButton (movieId: number) {
    const button = new ButtonBuilder()
      .setLabel('Where to watch')
      .setStyle(ButtonStyle.Link)
      .setURL(`https://www.themoviedb.org/movie/${movieId}/watch`)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)
    return row
  }
}

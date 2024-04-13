import { Command } from '@sapphire/framework'
import { SORTING_TYPES } from '../../../lib/interface/beatsaver/SearchSortingTypes'
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js'
import { capitalize } from '../../../lib/string/stringUtils'
import { type SearchResults } from '../../../lib/interface/beatsaver/SearchResults'
import { BEAT_SABER_EMBED_COLOR } from './bs-map'

export class BsSearchCommand extends Command {
  public constructor (context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: 'bs-search',
      description: 'Search for Beat Saber maps on BeatSaver.',
      cooldownDelay: 7000
    })
  }

  public override registerApplicationCommands (registry: Command.Registry): void {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option
            .setName('query')
            .setDescription('The search query.')
            .setRequired(true)
            .setMaxLength(70)
        )
        .addStringOption((option) =>
          option
            .setName('sort')
            .setDescription('How to sort the results. (Default: Rating)')
            .setRequired(false)
            .addChoices(...SORTING_TYPES)
        )
        .addBooleanOption((option) =>
          option
            .setName('ranked')
            .setDescription('Only include ranked maps. (Default: false)')
            .setRequired(false)
        )
    )
  }

  public async chatInputRun (interaction: ChatInputCommandInteraction) {
    await interaction.deferReply()
    const query = interaction.options.getString('query', true)
    const sort = interaction.options.getString('sort') ?? 'rating'
    const onlyRanked = interaction.options.getBoolean('ranked') ?? false

    let searchResults = null
    try {
      searchResults = await this.searchMaps(query, sort, onlyRanked)
    } catch (error) {
      console.error('bs-search error:', error)
      return await interaction.editReply({
        content: 'An error occurred while fetching the maps. Please try again later.'
      })
    }

    if (searchResults.docs.length === 0) {
      return await interaction.editReply({
        content: 'No maps found with that query.'
      })
    }

    const embed = this.getResultsEmbed(searchResults)
    await interaction.editReply({ embeds: [embed] })
  }

  /**
 * Searches for maps on BeatSaver based on the provided query and sort order.
 * @param query - The search query.
 * @param sort - The sort order for the search results.
 * @param ranked - Whether to only include ranked maps in the search results.
 * @returns A Promise that resolves to the JSON response containing the search results.
 * @throws An error if the request to BeatSaver fails.
 */
  private async searchMaps (query: string, sort: string, ranked: boolean): Promise<SearchResults> {
    const url = new URL('https://beatsaver.com/api/search/text/0')
    url.searchParams.append('q', query)
    url.searchParams.append('sortOrder', capitalize(sort))
    url.searchParams.append('ranked', ranked.toString())

    const response = await fetch(url.toString())
    if (!response.ok) throw new Error('Failed to fetch maps from BeatSaver.')
    return await response.json()
  }

  /**
 * Returns an EmbedBuilder object containing search results.
 *
 * @param results - The search results to be displayed.
 * @returns An EmbedBuilder object with formatted search results.
 */
  private getResultsEmbed (results: SearchResults): EmbedBuilder {
    // Only take first 10 results.
    let finalResults = results.docs
    if (finalResults.length > 10) {
      finalResults = finalResults.slice(0, 9)
    }

    const embed = new EmbedBuilder()
      .setColor(BEAT_SABER_EMBED_COLOR)
      .setTitle('Search Results')
      .setFooter({ text: `Found ${finalResults.length} maps.` })

    for (const result of finalResults) {
      embed.addFields({
        name: `${result.name} by ${result.metadata.levelAuthorName}`,
        value: `**ID:** ${result.id}\n**Ranked: ** ${result.ranked ? 'yes' : 'no'}`
      })
    }

    return embed
  }
}

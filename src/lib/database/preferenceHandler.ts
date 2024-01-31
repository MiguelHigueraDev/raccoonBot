import { container } from '@sapphire/framework'

/**
 * Checks if a user preference exists in the database for the specified guild and user.
 * If it doesn't exist, creates a new record for the preference.
 *
 * @param {string} guildId - The unique identifier for the guild.
 * @param {string} userId - The unique identifier for the user.
 * @param {number} preferenceId - The unique identifier for the preference.
 * @returns {Promise<boolean>} A promise that resolves to true if the preference exists or was successfully created, false otherwise.
 * @throws {Error} An error if there is an issue with the database operation.
 */
const checkIfPreferenceExists = async (guildId: string, userId: string, preferenceId: number): Promise<boolean> => {
  try {
    const foundPreference = await container.db.userPreferences.findFirst(
      { where: { userId, preferenceId, guildId } }
    )

    if (foundPreference === null) {
      await container.db.userPreferences.create({
        data: {
          userId, preferenceId, guildId
        }
      })
    }
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Enables a user preference for the specified guild and user.
 *
 * @param {string} guildId - The unique identifier for the guild.
 * @param {string} userId - The unique identifier for the user.
 * @param {number} preferenceId - The unique identifier for the preference.
 * @returns {Promise<boolean>} A promise that resolves to true if the preference is successfully enabled, false otherwise.
 * @throws {Error} An error if there is an issue with enabling the preference or if the preference creation fails.
 */
const enablePreference = async (guildId: string, userId: string, preferenceId: number): Promise<boolean> => {
  try {
    const checkPreference = await checkIfPreferenceExists(guildId, userId, preferenceId)
    if (!checkPreference) throw new Error(`Error creating preference ${preferenceId} for user ${userId} in guild ${guildId}`)

    await container.db.userPreferences.update({
      where: {
        guildId_preferenceId_userId: {
          guildId, preferenceId, userId
        }
      },
      data: {
        enabled: 1
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Disables a user preference for the specified guild and user.
 *
 * @param {string} guildId - The unique identifier for the guild.
 * @param {string} userId - The unique identifier for the user.
 * @param {number} preferenceId - The unique identifier for the preference.
 * @returns {Promise<boolean>} A promise that resolves to true if the preference is successfully disabled, false otherwise.
 * @throws {Error} An error if there is an issue with disabling the preference or if the preference creation fails.
 */
const disablePreference = async (guildId: string, userId: string, preferenceId: number): Promise<boolean> => {
  try {
    const checkPreference = await checkIfPreferenceExists(guildId, userId, preferenceId)
    if (!checkPreference) throw new Error(`Error creating preference ${preferenceId} for user ${userId} in guild ${guildId}`)

    await container.db.userPreferences.update({
      where: {
        guildId_preferenceId_userId: {
          guildId, preferenceId, userId
        }
      },
      data: {
        enabled: 0
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const preferenceHandler = {
  checkIfPreferenceExists,
  enablePreference,
  disablePreference
}

export default preferenceHandler

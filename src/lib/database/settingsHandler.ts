import { container } from '@sapphire/framework'
import guildHandler from './guildHandler'

/**
 * Checks if a setting exists for a specific guild in the database and creates it if not found.
 * If the guild doesn't exist, it will be created before checking or creating the setting.
 *
 * @param {string} guildId - The ID of the guild.
 * @param {number} settingId - The ID of the setting.
 * @returns {Promise<boolean>} A promise that resolves to true if the setting exists or is successfully created, and false otherwise.
 * @throws {Error} Throws an error if there is an issue creating the guild or setting.
 */
const checkIfSettingExists = async (guildId: string, settingId: number): Promise<boolean> => {
  try {
    // First check if guild exists, if not, create it
    const guildExists = await guildHandler.updateGuildStatus(guildId)
    if (!guildExists) throw new Error('Error creating guild')

    const foundSetting = await container.db.guildSettings.findUnique({
      where: { guildId_settingId: { guildId, settingId } }
    })

    if (foundSetting == null) {
      await container.db.guildSettings.create({
        data: {
          guildId, settingId, value: ''
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
 * Updates the value of a setting for a specific guild in the database.
 * If the setting does not exist, it will be created before updating its value.
 *
 * @param {string} guildId - The ID of the guild.
 * @param {number} settingId - The ID of the setting.
 * @param {string} content - The new value to be set for the setting.
 * @returns {Promise<boolean>} A promise that resolves to true if the setting is successfully updated, and false otherwise.
 * @throws {Error} Throws an error if there is an issue creating the setting or updating its value.
 */
const updateSetting = async (guildId: string, settingId: number, content: string): Promise<boolean> => {
  try {
    const checkSetting = await checkIfSettingExists(guildId, settingId)
    if (!checkSetting) throw new Error(`Error creating setting ${settingId} for guild ${guildId}`)
    await container.db.guildSettings.update({
      where: {
        guildId_settingId: {
          guildId, settingId
        }
      },
      data: {
        value: content
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Resets the value of a setting for a specific guild in the database to an empty string.
 * If the setting does not exist, it will be created before resetting its value.
 *
 * @param {string} guildId - The ID of the guild.
 * @param {number} settingId - The ID of the setting.
 * @returns {Promise<boolean>} A promise that resolves to true if the setting is successfully reset, and false otherwise.
 * @throws {Error} Throws an error if there is an issue creating the setting or resetting its value.
 */
const resetSetting = async (guildId: string, settingId: number): Promise<boolean> => {
  try {
    const checkSetting = await checkIfSettingExists(guildId, settingId)
    if (!checkSetting) throw new Error(`Error creating setting ${settingId} for guild ${guildId}`)

    await container.db.guildSettings.update({
      where: {
        guildId_settingId: {
          guildId, settingId
        }
      },
      data: {
        value: ''
      }
    })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Fetches all settings from the database.
 * @returns {Promise<Array<any> | boolean>} A promise that resolves to an array of settings if successful, or false if there is an error.
 */
const fetchSettings = async (): Promise<any[] | boolean> => {
  try {
    const settings = await container.db.setting.findMany()
    return settings
  } catch (error) {
    console.error(error)
    return false
  }
}

const fetchSetting = async (guildId: string, settingId: number): Promise<string | null> => {
  try {
    const checkSetting = await checkIfSettingExists(guildId, settingId)
    if (!checkSetting) throw new Error(`Error creating setting ${settingId} for guild ${guildId}`)

    const foundSetting = await container.db.guildSettings.findUnique({
      where: {
        guildId_settingId: {
          guildId, settingId
        }
      }
    })

    if (foundSetting === null) throw new Error('Setting not found in database.')
    return foundSetting.value
  } catch (error) {
    console.error(error)
    return null
  }
}

const settingsHandler = {
  checkIfSettingExists, updateSetting, resetSetting, fetchSettings, fetchSetting
}

export default settingsHandler

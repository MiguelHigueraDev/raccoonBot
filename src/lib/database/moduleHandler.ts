import { container } from '@sapphire/framework'

/**
 * Checks if a module exists for a specific guild in the database and creates it if not found.
 * @param {string} guildId - The ID of the guild.
 * @param {number} moduleId - The ID of the module.
 * @returns {Promise<boolean>} A promise that resolves to true if the module exists or is successfully created, and false otherwise.
 */
const checkIfModuleExists = async (guildId: string, moduleId: number): Promise<boolean> => {
  try {
    const foundModule = await container.db.guildModules.findFirst(
      { where: { guildId, moduleId } }
    )
    if (foundModule === null) {
      await container.db.guildModules.create({
        data: {
          guildId, moduleId
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
 * Enables a module for a specific guild in the database.
 * @param {string} guildId - The ID of the guild.
 * @param {number} moduleId - The ID of the module.
 * @returns {Promise<boolean>} A promise that resolves to true if the module is successfully enabled, and false otherwise.
 */
const enableModule = async (guildId: string, moduleId: number): Promise<boolean> => {
  try {
    const checkModule = await checkIfModuleExists(guildId, moduleId)
    if (!checkModule) throw new Error(`Error creating module ${moduleId} for guild ${guildId}`)

    await container.db.guildModules.update({
      where: {
        guildId_moduleId: {
          guildId, moduleId
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
 * Disables a module for a specific guild in the database.
 * @param {string} guildId - The ID of the guild.
 * @param {number} moduleId - The ID of the module.
 * @returns {Promise<boolean>} A promise that resolves to true if the module is successfully disabled, and false otherwise.
 */
const disableModule = async (guildId: string, moduleId: number): Promise<boolean> => {
  try {
    const checkModule = await checkIfModuleExists(guildId, moduleId)
    if (!checkModule) throw new Error(`Error creating module ${moduleId} for guild ${guildId}`)

    await container.db.guildModules.update({
      where: {
        guildId_moduleId: {
          guildId, moduleId
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

const moduleHandler = {
  checkIfModuleExists, enableModule, disableModule
}

export default moduleHandler

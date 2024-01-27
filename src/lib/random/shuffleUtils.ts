/**
 * Shuffles the elements of a given array in a random order using the Fisher-Yates (Knuth) shuffle algorithm.
 *
 * @param {string[]} [array=[]] - An array of strings that you want to shuffle. Default value is an empty array.
 * @returns {string[]} A new array containing the elements of the input array shuffled in a random order.
 *
 * @remarks
 * - The function does not modify the original array; instead, it returns a new array with the shuffled elements.
 * - The randomness is achieved through the use of the `Math.random()` function in the Fisher-Yates algorithm.
*/

export const shuffleArray = (array: string[] = []): string[] => {
  for (let i: number = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    const temp: string = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

export const splitString = (string: string): string[] => {
  const array = string.split(',')
  // Remove all whitespace from strings
  const trimmedArray = array.map((item) => item.trim())
  return trimmedArray
}

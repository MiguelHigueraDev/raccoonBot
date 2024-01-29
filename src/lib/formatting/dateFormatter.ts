/**
 * Checks if the provided date string has a valid format (YYYY-MM-DD, YYYY/MM/DD, or YYYY.MM.DD).
 *
 * @param {string} date - The input date string to be checked.
 * @returns {boolean} True if the date format is valid, false otherwise.
 */
const checkDateFormat = (date: string): boolean => {
  // Matches yyyy-mm-dd, yyyy/mm/dd and yyyy.mm.dd (or combinations like yyyy-mm.dd)
  const dateRegex = /^\d{4}(-|\/|\.)(0?[1-9]|1[012])(-|\/|\.)(0?[1-9]|[12][0-9]|3[01])$/
  return dateRegex.test(date)
}

/**
 * Checks if the provided year, month, and day form a valid date.
 *
 * @param {number} year - The year of the date.
 * @param {number} month - The month of the date (1-12).
 * @param {number} day - The day of the date.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
const checkValidDate = (year: number, month: number, day: number): boolean => {
  const currentYear = new Date().getFullYear()
  // There isn't anyone born outside of these lol
  if (year < 1907 || year > (currentYear - 6)) return false
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  // More specific cases
  // Check first if month is February
  if (month === 2) {
    if (day > 29) return false
    if (day === 29) {
      if (!checkIfLeapYear(year)) return false
    }
  } else {
    if (day > MONTHS[month]) return false
  }

  return true
}

const checkIfLeapYear = (year: number): boolean => (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0)

const MONTHS: any = {
  // February is a special case so it isn't included here, check above
  1: 31,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31
}

/**
 * Parses a date string to the 'YYYY-MM-DD' format.
 *
 * @param {string} date - The input date string to be parsed.
 * @returns {string | false} The parsed date in 'YYYY-MM-DD' format or false if the input date is invalid.
 */
const parseDate = (date: string) => {
  // Get first separator
  let firstSeparatorIndex = date.indexOf('-')
  if (firstSeparatorIndex === -1) firstSeparatorIndex = date.indexOf('/')
  if (firstSeparatorIndex === -1) firstSeparatorIndex = date.indexOf('.')

  // Get last separator
  let lastSeparatorIndex = date.lastIndexOf('-')
  if (lastSeparatorIndex === -1) lastSeparatorIndex = date.lastIndexOf('/')
  if (lastSeparatorIndex === -1) lastSeparatorIndex = date.lastIndexOf('.')

  // Get year, month, and day
  const year = date.substring(0, firstSeparatorIndex)
  let month = date.substring(firstSeparatorIndex + 1, lastSeparatorIndex)
  let day = date.substring(lastSeparatorIndex + 1)

  // Add zeroes if month and day lack them
  if (month.length === 1) month = '0' + month
  if (day.length === 1) day = '0' + day

  // Check if year, month, and day are valid.
  const isValid = checkValidDate(+year, +month, +day)
  if (!isValid) return false

  // After all checks, return formatted date
  const formattedDate = `${year}-${month}-${day}`
  return new Date(formattedDate).toISOString()
}

/**
 * Calculates the date of the next birthday based on the provided partial date.
 *
 * @param {string} parsedDate - Parsed birth date in 'YYYY-MM-DD' format.
 * @returns {string} The date of the next birthday in 'YYYY-MM-DD' format.
 */
const getNextBirthday = (parsedDate: string): string => {
  const currentYear = new Date().getFullYear()
  const nextBirthday = currentYear + parsedDate.slice(4)
  return nextBirthday
}

/**
 * Calculates the number of days until the next birthday.
 *
 * @param {string} nextBirthday - The date of the next birthday in string format (e.g., 'YYYY-MM-DD').
 * @returns {number} The number of days until the next birthday.
 */
const getDaysUntilBirthday = (nextBirthday: string): number => {
  const currentDateInMs = new Date().getTime()
  const birthdayInMs = new Date(nextBirthday).getTime()

  const difference = birthdayInMs - currentDateInMs
  const daysDifference = Math.round(difference / (1000 * 3600 * 24))
  return daysDifference
}

/**
 * Calculates a future discord timestamp based on the current time and a specified number of minutes.
 *
 * @param {number} minutesInTheFuture - The number of minutes to add to the current time.
 * @returns {number} The calculated future timestamp in seconds.
 */
const getFutureTimestamp = (minutesInTheFuture: number): number => {
  const currentTime = new Date()
  const milliseconds = minutesInTheFuture * 60000
  const futureTimeStamp = new Date(currentTime.getTime() + milliseconds)
  // Timestamp in seconds
  return Math.round(+futureTimeStamp / 1000)
}

const DateFormatter = {
  checkDateFormat, checkValidDate, parseDate, getNextBirthday, getDaysUntilBirthday, getFutureTimestamp
}

export default DateFormatter

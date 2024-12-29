import { addYears, format, isValid, parse } from 'date-fns'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DateFormatter {
  public static checkDateFormat (date: string): boolean {
    // Support both yyyy-mm-dd and mm-dd formats
    const fullDateRegex = /^\d{4}[-/.]\d{2}[-/.]\d{2}$/
    const shortDateRegex = /^\d{2}[-/.]\d{2}$/
    return fullDateRegex.test(date) || shortDateRegex.test(date)
  }

  public static parseDate (date: string): string | false {
    try {
      // Normalize separators to '-'
      const normalizedDate = date.replace(/[./]/g, '-')

      // Check if it's a short date (mm-dd)
      if (/^\d{2}-\d{2}$/.test(normalizedDate)) {
        const [month, day] = normalizedDate.split('-')
        const fullDate = `1960-${month}-${day}` // Use 1960 as default year
        const parsedDate = parse(fullDate, 'yyyy-MM-dd', new Date())
        if (!isValid(parsedDate)) return false
        return format(parsedDate, 'yyyy-MM-dd')
      }

      // Full date handling (yyyy-mm-dd)
      const parsedDate = parse(normalizedDate, 'yyyy-MM-dd', new Date())
      if (!isValid(parsedDate)) return false
      return format(parsedDate, 'yyyy-MM-dd')
    } catch (error) {
      return false
    }
  }

  public static getNextBirthday (date: string): string {
    const birthday = new Date(date)
    const today = new Date()
    const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())

    if (nextBirthday < today) {
      return addYears(nextBirthday, 1).toISOString()
    }

    return nextBirthday.toISOString()
  }
}

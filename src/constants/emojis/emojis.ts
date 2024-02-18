export const EMOJIS = {
  fullBar: '<:full_bar:1204225171343413288>',
  halfBar: '<:half_bar:1204225156218880150>',
  emptyBar: '<:empty_bar:1204225133485494312>',
  loading: '<a:loading:1205300536396484659>'
}

export const EMOJI_PERCENTAGES = {
  100: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}`,
  95: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}`,
  90: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}`,
  85: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}`,
  80: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  75: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  70: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  65: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  60: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  55: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  50: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  45: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  40: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  35: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  30: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  25: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  20: `${EMOJIS.fullBar}${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  15: `${EMOJIS.fullBar}${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  10: `${EMOJIS.fullBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  5: `${EMOJIS.halfBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`,
  0: `${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}${EMOJIS.emptyBar}`
}

export const getPercentageBar = (percentage: number) => {
  if (percentage === 0) return EMOJI_PERCENTAGES[0]
  if (percentage < 6) return EMOJI_PERCENTAGES[5]
  if (percentage < 11) return EMOJI_PERCENTAGES[10]
  if (percentage < 16) return EMOJI_PERCENTAGES[15]
  if (percentage < 21) return EMOJI_PERCENTAGES[20]
  if (percentage < 26) return EMOJI_PERCENTAGES[25]
  if (percentage < 31) return EMOJI_PERCENTAGES[30]
  if (percentage < 36) return EMOJI_PERCENTAGES[35]
  if (percentage < 41) return EMOJI_PERCENTAGES[40]
  if (percentage < 46) return EMOJI_PERCENTAGES[45]
  if (percentage < 51) return EMOJI_PERCENTAGES[50]
  if (percentage < 56) return EMOJI_PERCENTAGES[55]
  if (percentage < 61) return EMOJI_PERCENTAGES[60]
  if (percentage < 66) return EMOJI_PERCENTAGES[65]
  if (percentage < 71) return EMOJI_PERCENTAGES[70]
  if (percentage < 76) return EMOJI_PERCENTAGES[75]
  if (percentage < 81) return EMOJI_PERCENTAGES[80]
  if (percentage < 86) return EMOJI_PERCENTAGES[85]
  if (percentage < 91) return EMOJI_PERCENTAGES[90]
  if (percentage < 96) return EMOJI_PERCENTAGES[95]
  return EMOJI_PERCENTAGES[100]
}

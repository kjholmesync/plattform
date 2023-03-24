export const TRANSITION = 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)'

export const RADIUS = 9
export const SMALL_RADIUS = 6
export const PADDING_TOP = 100
export const PADDING_LEFT = 0
export const CIRCLE_PADDING = 3
export const COLUMNS = 10
export const SIZE = 2 * RADIUS + CIRCLE_PADDING

export const dataSet = [...Array(100)].map((d, i) => {
  const colIndex = i % COLUMNS
  const rowIndex = Math.floor(i / COLUMNS)
  return {
    cx: colIndex * SIZE + RADIUS,
    cy: rowIndex * SIZE,
    r: RADIUS,
    delay: i * 5,
    id: i,
  }
})

export const COLORS = {
  light: {
    one: '#98d7d5',
    oneBright: '#08dedb',
    two: '#b79ec6',
    twoBright: '#a92bf8',
    three: '#e2ba81',
    threeBright: '#ff9500',
    four: '#b2e2ec',
    fourBright: '#00d5ff',
    default: '#cfcfcf',
  },
  dark: {
    one: '#376867',
    oneBright: '#0dcbc8',
    two: '#8b63a4',
    twoBright: '#b743ff',
    three: '#9b794a',
    threeBright: '#fa9e1e',
    four: '#5c8f99',
    fourBright: '#00d5ff',
    default: '#737373',
  },
}

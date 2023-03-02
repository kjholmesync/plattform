import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#ffdc5e'
const COLORS = ['#ffdd5e', '#ce9fc7', '#67a9d9', '#f49787', '#75d69c']

export const questionColor = scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  COLORS,
)

type QuestionConfigType = {
  ids: number[]
  valueLength?: {
    min?: number
    max?: number
  }
}

// TODO: adjust min and max length
export const QUESTIONS: QuestionConfigType[] = [
  { ids: [0, 1] },
  { ids: [2, 3], valueLength: { max: 200 } },
  { ids: [4, 5], valueLength: { max: 200 } },
  { ids: [6], valueLength: { max: 200 } },
  { ids: [7], valueLength: { max: 200 } },
  { ids: [8] },
  { ids: [9], valueLength: { max: 200 } },
  { ids: [10], valueLength: { max: 200 } },
  { ids: [11], valueLength: { max: 200 } },
  { ids: [12, 13], valueLength: { max: 200 } },
  { ids: [14] },
]

export const EDIT_QUESTIONNAIRE_PATH = '/2023/03/03/fragen-zur-klimakrise'
export const OVERVIEW_QUESTIONNAIRE_PATH = '/klimafragebogen'

export const QUESTIONNAIRE_SLUG = 'klima-fragebogen'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png'

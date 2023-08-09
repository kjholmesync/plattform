import { csvParse } from 'd3-dsv'
import { nest } from 'd3-collection'
import { leftJoin } from '../../../components/PoliticsQuestionnaire/utils'
import { QUESTION_TYPES } from '../../../components/PoliticsQuestionnaire/config'
import {
  createGetStaticPaths,
  createGetStaticProps,
} from '../../../lib/apollo/helpers'
import SubmissionsOverview from '../../../components/PoliticsQuestionnaire/Overview'
import { loadPoliticQuestionnaireCSV } from '../../../components/PoliticsQuestionnaire/loader'

export default ({ submissionData, party }) => (
  <SubmissionsOverview party={party} submissionData={submissionData} />
)

export const getStaticProps = createGetStaticProps(
  async (_, { params: { party } }) => {
    const data = await loadPoliticQuestionnaireCSV()

    const responses = csvParse(data).filter(
      (response) => response.answer !== 'NA',
    )

    const joinedData = leftJoin(responses, QUESTION_TYPES, 'questionSlug')

    const filterByLength = joinedData
      .filter((item) => {
        if (item.type === 'choice') return item
        return (
          item.answer.length > item.answerLength?.min &&
          item.answer.length < item.answerLength?.max
        )
      })
      .sort(() => Math.random() - 0.5)

    const filteredByParty = party
      ? joinedData.filter(
          (response) => response.party === decodeURIComponent(party),
        )
      : filterByLength

    const groupedData = nest()
      .key((d) => d.questionSlug)
      .rollup((values) =>
        values[0].type === 'choice' || party ? values : values.slice(0, 6),
      )
      .entries(filteredByParty)

    return {
      props: {
        submissionData: groupedData,
        party,
      },
    }
  },
)

export const getStaticPaths = createGetStaticPaths(async () => {
  const data = await loadPoliticQuestionnaireCSV()

  const responses = csvParse(data).filter(
    (response) => response.answer !== 'NA',
  )

  const paths = [...new Set(responses.map((response) => response.party))].map(
    (party) => ({ params: { party: encodeURIComponent(party) } }),
  )

  return {
    paths,
    fallback: false,
  }
})

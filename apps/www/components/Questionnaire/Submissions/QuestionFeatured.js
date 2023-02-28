import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import scrollIntoView from 'scroll-into-view'

import { useQuery } from '@apollo/client'

import {
  ColorContextProvider,
  colors,
  Container,
  Editorial,
  inQuotes,
  Interaction,
  Loader,
  NarrowContainer,
  ArrowRightIcon,
} from '@project-r/styleguide'

import { useMe } from '../../../lib/context/MeContext'

import { EDIT_QUESTIONNAIRE_PATH } from '../../Climatelab/Questionnaire/config'

import {
  QUESTIONNAIRE_SUBMISSION_BOOL_QUERY,
  QUESTIONNAIRE_SUBMISSIONS_QUERY,
} from './graphql'
import { AnswersGrid, AnswersGridCard } from './AnswersGrid'
import { QuestionSummaryChart } from './QuestionChart'

export const getTargetedAnswers = (questionIds, results) => {
  return results?.nodes.map((submission) => {
    return {
      answers: submission.answers.nodes.filter((answer) =>
        questionIds.includes(answer.question.id),
      ),
      displayAuthor: submission.displayAuthor,
    }
  })
}

export const PersonLink = ({ displayAuthor, children }) => {
  return (
    <Link href={`/klimafragebogen/${displayAuthor.slug}`} passHref>
      {children}
    </Link>
  )
}

export const QuestionLink = ({ questions, children }) => {
  const router = useRouter()
  const pathname = router.asPath.split('?')[0].split('#')[0]
  return (
    <Link
      href={{
        pathname,
        query: {
          share: questions.map((q) => q.id),
        },
      }}
      shallow
      passHref
    >
      {children}
    </Link>
  )
}

export const LinkToEditQuestionnaire = ({ slug, children }) => {
  const { me } = useMe()
  const { loading, data } = useQuery(QUESTIONNAIRE_SUBMISSION_BOOL_QUERY, {
    skip: !me,
    variables: { slug, userIds: [me?.id] },
  })
  const hasFilledQuestionnaire = data?.questionnaire?.results?.totalCount > 0
  return (
    <Editorial.P>
      {loading || !hasFilledQuestionnaire ? (
        <span>
          Wie lauten Ihre Antworten? Füllen Sie unseren Klimafragebogen{' '}
          <Link href={EDIT_QUESTIONNAIRE_PATH}>
            <Editorial.A>hier</Editorial.A>
          </Link>{' '}
          aus.
        </span>
      ) : (
        <span>
          Sie möchten Ihre eigenen Antworten teilen oder nochmals bearbeiten?{' '}
          <Link href={`/klimafragebogen/${me.slug || me.id}`}>
            <Editorial.A> Hierlang.</Editorial.A>
          </Link>
        </span>
      )}
      {children}
    </Editorial.P>
  )
}

export const AnswersChart = ({ question, skipTitle }) => {
  const totalAnswers = question.result.reduce((agg, r) => agg + r.count, 0)
  const values = question.options.map((option) => ({
    answer: option.label,
    value:
      (question.result.find((result) => result.option.value === option.value)
        ?.count ?? 0) / totalAnswers,
  }))

  return (
    <NarrowContainer>
      <div style={{ marginTop: 20 }}>
        {!skipTitle && (
          <Editorial.Subhead style={{ textAlign: 'center' }}>
            {question.text}
          </Editorial.Subhead>
        )}
        <div style={{ marginTop: 20 }}>
          <QuestionSummaryChart answers={values} key='answer' />
        </div>
      </div>
    </NarrowContainer>
  )
}

const AnswerGridOverview = ({ slug, question, valueLength }) => {
  const { loading, error, data } = useQuery(QUESTIONNAIRE_SUBMISSIONS_QUERY, {
    variables: {
      slug,
      first: 6,
      sortBy: 'random',
      answers: [
        {
          questionId: question.id,
          valueLength,
        },
      ],
    },
  })

  // TODO filter answers by length, make Carousel with short answers and carousels with long answers

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const {
          questionnaire: { results },
        } = data

        const targetedAnswers = getTargetedAnswers([question.id], results) ?? []

        return (
          <>
            <NarrowContainer>
              <Editorial.Subhead style={{ textAlign: 'center' }}>
                {question.text}
              </Editorial.Subhead>
            </NarrowContainer>
            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <AnswersGrid>
                {targetedAnswers.map(({ answers, displayAuthor }) => (
                  <AnswersGridCard
                    key={displayAuthor.slug}
                    textLength={answers[0].payload.value.length}
                  >
                    <PersonLink displayAuthor={displayAuthor}>
                      <a style={{ textDecoration: 'none' }}>
                        <div {...styles.answerCard}>
                          <div>
                            <Editorial.Question style={{ marginTop: 0 }}>
                              {inQuotes(answers[0].payload.value)}
                            </Editorial.Question>
                            <Editorial.Credit>
                              Von {displayAuthor.name} <ArrowRightIcon />
                            </Editorial.Credit>
                          </div>
                        </div>
                      </a>
                    </PersonLink>
                  </AnswersGridCard>
                ))}
              </AnswersGrid>
            </ColorContextProvider>
          </>
        )
      }}
    />
  )
}

export const QuestionFeatured = ({ slug, questions, bgColor, valueLength }) => {
  const router = useRouter()
  const { query } = router

  const hasTextAnswer = questions.some(
    (q) => q.__typename === 'QuestionTypeText',
  )

  const questionRef = useRef()
  useEffect(() => {
    if (query?.focus === questions[0].id) {
      scrollIntoView(questionRef.current)
    }
  }, [])

  return (
    <div
      ref={questionRef}
      id={questions[0].id}
      style={{
        padding: '0 0 46px 0',
        // flexBasis: '50%',
        backgroundColor: bgColor,
        display: 'flex',
      }}
    >
      <Container>
        {questions.map((q) => {
          return q.__typename === 'QuestionTypeText' ? (
            <AnswerGridOverview
              key={q.id}
              slug={slug}
              question={q}
              valueLength={valueLength}
            />
          ) : q.__typename === 'QuestionTypeChoice' ? (
            <AnswersChart key={q.id} question={q} />
          ) : null
        })}

        {hasTextAnswer && (
          <NarrowContainer>
            <Interaction.P style={{ textAlign: 'center' }}>
              <QuestionLink questions={questions}>
                <Editorial.A>
                  Alle Antworten lesen
                  {/* <ChevronRightIcon /> */}
                </Editorial.A>
              </QuestionLink>
            </Interaction.P>
          </NarrowContainer>
        )}
      </Container>
    </div>
  )
}

const styles = {
  answerCard: css({
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: 24,
    color: 'black',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    textAlign: 'center',
  }),
}

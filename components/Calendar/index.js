import React, { useEffect, useState } from 'react'
import gql from 'graphql-tag'
import { css } from 'glamor'
import { compose, graphql } from 'react-apollo'
import { withRouter } from 'next/router'
import { Router } from '../../lib/routes'
import {
  datePickerFormat,
  getPublicationCalendar,
  getUrlWeekEnd,
  getUrlWeekStart,
  isCurrentWeek,
  now,
  offsetUrlWeek,
  reformatUrlDate
} from './utils'
import Day from './Day'

const reposPerWeek = gql`
  query repoWeek($publishDateRange: RepoPublishDateRange) {
    reposSearch(first: 100, publishDateRange: $publishDateRange) {
      nodes {
        id
        meta {
          publishDate
        }
        latestCommit {
          id
          date
          message
          author {
            name
          }
          document {
            id
            meta {
              template
              title
              series {
                title
              }
              section {
                id
                meta {
                  title
                }
              }
              format {
                id
                meta {
                  title
                }
              }
              dossier {
                id
                meta {
                  title
                }
              }
            }
          }
        }
        currentPhase {
          key
          color
          label
        }
      }
    }
  }
`

const styles = {
  container: css({
    display: 'flex',
    minHeight: 500
  })
}

const Calendar = ({
  router: {
    query,
    query: { from = getUrlWeekStart(now), until = getUrlWeekEnd(now) }
  },
  data: { reposSearch: repos }
}) => {
  const [calendar, setCalendar] = useState([])

  useEffect(() => {
    setCalendar(getPublicationCalendar(from, until, repos))
  }, [from, until, repos])

  const changeDates = dates =>
    Router.replaceRoute('index', { ...query, ...dates })

  const offsetDates = offset =>
    changeDates({
      from: offsetUrlWeek(from, offset),
      until: offsetUrlWeek(until, offset)
    })

  const resetDates = () =>
    changeDates({
      from: getUrlWeekStart(now),
      until: getUrlWeekEnd(now)
    })

  return (
    <div>
      <span>
        <button onClick={() => offsetDates(-1)}>Previous</button>
        {reformatUrlDate(from, datePickerFormat)} -{' '}
        {reformatUrlDate(until, datePickerFormat)}
        <button onClick={() => offsetDates(1)}>Next</button>
        <button onClick={resetDates}>Reset</button>
        <br />
        <br />
        {isCurrentWeek(from) ? 'current week' : 'other week'}
        <br />
        <br />
      </span>
      <div {...styles.container}>
        {calendar.map(day => (
          <Day key={day.date} day={day} />
        ))}
      </div>
    </div>
  )
}

export default compose(
  withRouter,
  graphql(reposPerWeek, {
    options: ({
      router: {
        query: { from, until }
      }
    }) => {
      return {
        fetchPolicy: 'network-only',
        ssr: false,
        notifyOnNetworkStatusChange: true,
        variables: {
          publishDateRange: from &&
            until && {
              from,
              until
            }
        }
      }
    }
  })
)(Calendar)

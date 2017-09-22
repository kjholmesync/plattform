import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { compose } from 'redux'

import { InlineSpinner } from '../Spinner'
import Loader from '../Loader'
import { css } from 'glamor'

import withT from '../../lib/withT'
import { Link, Router } from '../../lib/routes'
import { errorToString } from '../../lib/utils/errors'
import { swissTime } from '../../lib/utils/format'
import {
  Interaction,
  Label,
  linkRule,
  Button,
  Field,
  Checkbox,
  colors
} from '@project-r/styleguide'

import MaskedInput from 'react-maskedinput'

import { query as treeQuery } from '../../pages/repo/tree'

const timeFormat = swissTime.format('%d. %B %Y, %H:%M Uhr')

const query = gql`
  query repoWithCommit($repoId: ID!, $commitId: ID!) {
    repo(id: $repoId) {
      id
      commit(id: $commitId) {
        id
        message
        date
        author {
          email
          name
        }
        document {
          content
          meta {
            title
            description
            image
          }
        }
      }
    }
  }
`

const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent'
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc'
      }
    }
  })
}

const scheduledAtFormat = '%d.%m.%Y %H:%M'
const scheduledAtParser = swissTime.parse(scheduledAtFormat)
const scheduledAtFormater = swissTime.format(scheduledAtFormat)

const mutation = gql`
mutation publish(
  $repoId: ID!,
  $commitId: ID!,
  $prepublication: Boolean!,
  $scheduledAt: DateTime,
  $updateMailchimp: Boolean!
) {
  publish(
    repoId: $repoId,
    commitId: $commitId,
    prepublication: $prepublication,
    scheduledAt: $scheduledAt,
    updateMailchimp: $updateMailchimp) {
    name
  }
}
`

class PublishForm extends Component {
  constructor (...args) {
    super(...args)

    const nextMorning = new Date()
    if (nextMorning.getHours() > 5) {
      nextMorning.setDate(nextMorning.getDate() + 1)
    }
    nextMorning.setHours(7)
    nextMorning.setMinutes(0)

    this.state = {
      prepublication: true,
      scheduled: false,
      scheduledAt: scheduledAtFormater(nextMorning),
      updateMailchimp: false
    }
  }
  render () {
    const { t, data, repoId } = this.props
    const {
      prepublication, updateMailchimp, scheduled, scheduledAt,
      publishing
    } = this.state
    const { loading, error, repo } = data

    const scheduledAtDate = scheduledAtParser(scheduledAt)
    const scheduledAtError = scheduledAtDate === null && t('publish/label/scheduledAt')

    return (
      <Loader loading={loading} error={error} render={() => {
        const { commit } = repo

        return (
          <div>
            <Label>{t('publish/commit/selected')}</Label>
            <Interaction.P>
              {commit.message}
            </Interaction.P>
            <Label>
              {commit.author.name}<br />
              {timeFormat(new Date(commit.date))}
            </Label>
            <Interaction.P>
              <Label>
                <Link
                  route='repo/tree'
                  params={{
                    repoId: repoId.split('/')
                  }}
                >
                  <a {...linkRule}>
                    {t('publish/commit/change')}
                  </a>
                </Link>
              </Label>
            </Interaction.P>

            <br /><br />

            <Checkbox checked={prepublication} onChange={(_, value) => {
              this.setState({
                prepublication: value
              })
            }}>
              {t('publish/label/prepublication')}
            </Checkbox>
            <br />
            <br />
            <Checkbox checked={updateMailchimp} onChange={(_, value) => {
              this.setState({
                updateMailchimp: value
              })
            }}>
              {t('publish/label/updateMailchimp')}
            </Checkbox>
            <br />
            <br />
            <Checkbox checked={scheduled} onChange={(_, value) => {
              this.setState({
                scheduled: value
              })
            }}>
              {t('publish/label/scheduled')}
            </Checkbox>

            {scheduled && <Field
              renderInput={(inputProps) => (
                <MaskedInput
                  {...inputProps}
                  {...styles.mask}
                  placeholderChar={'_'}
                  mask={'11.11.1111 11:11'} />
              )}
              label={t('publish/label/scheduledAt')}
              value={scheduledAt}
              error={scheduledAtError}
              onChange={(_, value) => {
                this.setState({
                  scheduledAt: value
                })
              }} />}

            <br /><br /><br />

            {publishing ? (
              <div style={{textAlign: 'center'}}>
                <InlineSpinner />
              </div>
            ) : (
              <div>
                {!!this.state.error && (
                  <div style={{color: colors.error, marginBottom: 40}}>
                    {this.state.error}
                  </div>
                )}
                <Button block primary onClick={() => {
                  if (scheduled && scheduledAtError) {
                    return
                  }
                  this.setState(() => ({publishing: true}))
                  this.props.publish({
                    repoId,
                    commitId: commit.id,
                    prepublication,
                    updateMailchimp,
                    scheduledAt: scheduled ? scheduledAtDate : undefined
                  }).then(() => {
                    Router.pushRoute('repo/tree', {
                      repoId: repoId.split('/')
                    })
                  }).catch((error) => {
                    this.setState(() => ({
                      publishing: false,
                      error: errorToString(error)
                    }))
                  })
                }}>
                  {t('publish/trigger')}
                </Button>
              </div>
            )}
          </div>
        )
      }} />
    )
  }
}

export default compose(
  withT,
  graphql(mutation, {
    props: ({mutate}) => ({
      publish: variables => mutate({
        variables,
        refetchQueries: [{
          query: treeQuery,
          variables: {
            repoId: variables.repoId
          }
        }]
      })
    })
  }),
  graphql(query, {
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId,
        commitId: url.query.commitId
      }
    })
  })
)(PublishForm)

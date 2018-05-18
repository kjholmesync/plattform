import React, { Component, Fragment } from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import { Button, InlineSpinner } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { Router } from '../../lib/routes'

import Consents, { getConstentsError } from '../Pledge/Consents'
import ErrorMessage from '../ErrorMessage'

const goTo = (type, email) => Router.replaceRoute(
  'notifications',
  { type, email, context: 'authorization' }
)

class NewsletterSubscription extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const { t, updateNewsletterSubscription, email } = this.props
    const { consents } = this.state

    const requiredConsents = ['PRIVACY']
    const constentsError = getConstentsError(
      t,
      requiredConsents,
      consents
    )
    const error = this.state.error || (
      this.state.dirty && constentsError
    )

    return (
      <Fragment>
        <div style={{margin: '20px 0', textAlign: 'left'}}>
          <Consents
            accepted={consents}
            required={requiredConsents}
            onChange={keys => {
              this.setState({
                consents: keys,
                error: undefined
              })
            }} />
        </div>
        {!!error && <ErrorMessage error={error} />}
        <br />
        {this.state.updating
          ? <div style={{textAlign: 'center'}}><InlineSpinner /></div>
          : (
            <div style={{opacity: constentsError ? 0.5 : 1}}>
              <Button
                primary
                onClick={() => {
                  if (constentsError) {
                    this.setState({dirty: true})
                    return
                  }
                  this.setState({updating: true}, () => {
                    updateNewsletterSubscription({
                      consents
                    })
                      .then(() => goTo('email-confirmed', email))
                      .catch(error => {
                        this.setState({
                          updating: false,
                          error
                        })
                      })
                  })
                }}>
                {t('macNewsletterSubscription/button')}
              </Button>
            </div>
          )}
      </Fragment>
    )
  }
}

const mutation = gql`
  mutation updateNewsletterSubscriptionWithMac(
    $name: NewsletterName!
    $subscribed: Boolean!
    $email: String!
    $mac: String!
    $consents: [String!]
  ) {
    updateNewsletterSubscription(name: $name, subscribed: $subscribed, email: $email, mac: $mac, consents: $consents) {
      id
      name
      subscribed
      isEligible
    }
  }
`

export default compose(
  graphql(mutation, {
    props: ({ mutate, ownProps: { name, subscribed, email, mac } }) => ({
      updateNewsletterSubscription: ({ consents }) =>
        mutate({
          variables: {
            name,
            subscribed,
            email,
            mac,
            consents
          }
        })
    })
  }),
  withT
)(NewsletterSubscription)

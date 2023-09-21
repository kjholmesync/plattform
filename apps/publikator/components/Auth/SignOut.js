import { Component } from 'react'
import PropTypes from 'prop-types'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import withT from '../../lib/withT'
import { errorToString } from '../../lib/utils/errors'
import { ME_QUERY } from '../../lib/withMe'

import { A, InlineSpinner } from '@project-r/styleguide'

class SignOut extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }
  render() {
    const { t } = this.props
    const { loading, error } = this.state

    return (
      <span>
        <A
          href='#'
          onClick={(e) => {
            e.preventDefault()
            if (loading) {
              return
            }
            this.setState(() => ({
              loading: true,
            }))
            this.props
              .signOut()
              .then(({ data }) => {
                if (data) {
                  this.setState(() => ({
                    loading: false,
                  }))
                } else {
                  this.setState(() => ({
                    error: t('signOut/error'),
                    loading: false,
                  }))
                }
              })
              .catch((error) => {
                this.setState(() => ({
                  error: errorToString(error),
                  loading: false,
                }))
              })
          }}
        >
          {t('signOut/label')}
        </A>
        {loading && <InlineSpinner size={25} />}
        {!!error && ` – ${error}`}
      </span>
    )
  }
}

SignOut.propTypes = {
  signOut: PropTypes.func.isRequired,
}

const signOutMutation = gql`
  mutation signOut {
    signOut
  }
`

export const withSignOut = compose(
  graphql(signOutMutation, {
    props: ({ mutate, ownProps }) => ({
      signOut: () =>
        mutate({
          refetchQueries: [
            {
              query: ME_QUERY,
            },
          ],
        }),
    }),
  }),
)

export default compose(withSignOut, withT)(SignOut)

import React from 'react'
import { Link } from '../../lib/routes'
import { linkRule } from '@project-r/styleguide'
import withT from '../../lib/withT'
import { intersperse } from '../../lib/utils/helpers'

const menu = [
  {
    key: 'edit',
    route: 'repo/edit'
  },
  {
    key: 'tree',
    route: 'repo/tree'
  }
]

const Nav = ({url, route, t}) => {
  const { repoId } = url.query

  const params = {
    repoId: repoId.split('/')
  }

  return (
    <span>
      {intersperse(
        menu.map(item => {
          const label = t(`repo/nav/${item.key}`)
          if (item.route === route) {
            return <span key={item.route}>{label}{' '}</span>
          }
          return (
            <Link
              key={item.route}
              route={item.route}
              params={params}
            >
              <a {...linkRule}>
                {label}
                {' '}
              </a>
            </Link>
          )
        }),
        (_, i) => <span key={i}>&nbsp;</span>
      )}
    </span>
  )
}

export default withT(Nav)

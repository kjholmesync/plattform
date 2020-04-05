import React, { useState, useEffect } from 'react'
import { colors } from '@project-r/styleguide'
import Loader from '../Loader'
import { compose, graphql } from 'react-apollo'
import {
  notificationsQuery,
  withMarkAllAsReadMutation,
  withNotificationCount
} from './enhancers'
import { css } from 'glamor'
import NotificationFeed from './NotificationFeed'

export const isNewStyle = css({
  backgroundColor: colors.primaryBg
})

export const containsUnread = (notifications, after) =>
  notifications &&
  notifications.nodes &&
  notifications.nodes
    .filter(n => !after || new Date(n.createdAt) > after)
    .filter(n => !n.readAt).length

const Notifications = compose(
  graphql(notificationsQuery),
  withMarkAllAsReadMutation,
  withNotificationCount
)(
  ({
    data: { error, loading, notifications, me, fetchMore, refetch },
    countData,
    markAllAsReadMutation
  }) => {
    const [loadedAt, setLoadedAt] = useState(new Date())
    const futureNotifications = containsUnread(
      countData.notifications,
      loadedAt
    )

    useEffect(() => {
      if (!loading && !error) {
        markAllAsReadMutation()
      }
    }, [loading, error])

    const reload = () => {
      refetch()
      setLoadedAt(new Date())
    }

    return (
      <Loader
        error={error}
        loading={loading}
        render={() =>
          notifications ? (
            <NotificationFeed
              futureNotifications={futureNotifications}
              onReload={reload}
              notifications={notifications}
              me={me}
              loadedAt={loadedAt}
              fetchMore={fetchMore}
            />
          ) : null
        }
      />
    )
  }
)

export default Notifications

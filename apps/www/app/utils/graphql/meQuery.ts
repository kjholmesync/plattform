import { gql } from '@apollo/client'

export const meQuery = gql`
  query me {
    me {
      id
      username
      slug
      portrait
      name
      firstName
      lastName
      email
      initials
      roles
      isListed
      hasPublicProfile
      discussionNotificationChannels
      accessCampaigns {
        id
      }
      hasDormantMembership
      prolongBeforeDate
      activeMembership {
        id
        type {
          name
        }
        renew
        endDate
        graceEndDate
        canProlong
      }
    }
  }
`

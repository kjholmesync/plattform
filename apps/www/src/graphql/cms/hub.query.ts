import { gql } from '../gql'

export const CHALLENGE_ACCEPTED_HUB_QUERY = gql(`
query ChallengeAcceptedHubQuery {
  hub: challengeAcceptedHub {
    id
    introduction {
      value
    }
    items {
      __typename
      ... on EventRecord {
        id
        title
        description {
          value
        }
        location
        startAt
      }
      ... on ArticleRecord {
        id
        repoid
      }
      ... on NewsletterRecord {
        id
        repoid
      }
    }
  }
  people: allPeople {
    id
    slug
    name
    portrait {
      url
      height
      width
    }
  }
}
`)

import { gql } from '@apollo/client'
import Profile from '../../components/Profile/Page'
import { createGetServerSideProps } from '../../lib/apollo/helpers'

export default Profile

const GET_PUBLIC_USER_SLUG = gql`
  query getPublicUserSlug($slug: String!) {
    user(slug: $slug) {
      id
      username
      slug
    }
  }
`

const GET_PROFILE_REDIRECT = gql`
  query GetProfileRedirect($path: String!) {
    redirection(path: $path) {
      source
      target
      status
    }
  }
`

export const getServerSideProps = createGetServerSideProps(
  async ({ client, ctx, user: me }) => {
    const slug = ctx.params?.slug

    // Redirect to own profile
    if (slug === 'me') {
      return {
        redirect: {
          destination: `/~${me.slug}`,
          permanent: false,
        },
      }
    }

    const {
      data: { user },
    } = await client.query({
      query: GET_PUBLIC_USER_SLUG,
      variables: { slug },
    })

    if (user) {
      // Redirect id to username if available
      // (user.slug is either username or id, so we check for both to avoid infinite redirects)
      if (user.username && user.id === slug) {
        return {
          redirect: { destination: `/~${user.slug}`, permanent: false },
        }
      }

      return { props: { user } }
    }

    // check if a redirect is registered for this path
    const {
      data: { redirection },
    } = await client.query({
      query: GET_PROFILE_REDIRECT,
      variables: { path: `/~${slug}` },
    })

    if (redirection) {
      return {
        redirect: {
          destination: redirection.target,
          permanent: redirection.status === 301,
        },
      }
    }

    return {
      notFound: true,
    }
  },
)

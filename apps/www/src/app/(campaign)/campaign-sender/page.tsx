import { UserInviteLinkInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import Link from 'next/link'

export default async function Page() {
  const { data } = await getClient().query({
    query: UserInviteLinkInfoDocument,
  })

  const url = `/campaign-receiver/${data.me?.accessToken}`

  return (
    <div>
      Hey, du kannst jemanden einladen mit diesem Link:{' '}
      <Link href={url}>
        {process.env.NEXT_PUBLIC_BASE_URL}
        {url}
      </Link>
    </div>
  )
}

import Link from 'next/link'
import { getClient } from './utils/ApolloClient'
import { meQuery } from './utils/graphql/meQuery'

export default async function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe()

  return (
    <html lang='de'>
      <body>
        <Frame me={me} />
        {children}
      </body>
    </html>
  )
}

const getMe = async () => {
  const { data } = await getClient().query({ query: meQuery })

  return data.me
}

const Frame = ({ me }) => {
  return (
    <div>
      {' '}
      {me ? (
        `Hey, ${me.firstName}`
      ) : (
        <Link href='/anmelden'>Anmelden</Link>
      )} | <Link href='/'>Ab zum Magazin</Link>
    </div>
  )
}

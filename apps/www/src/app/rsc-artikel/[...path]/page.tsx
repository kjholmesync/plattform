import { ArticleDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { MdastRender } from './mdast-render'
import { getClient } from '@app/lib/apollo/client'
// import { renderMdast } from '@app/lib/mdast/render'
import { matchType, renderMdast } from '@republik/mdast-react-render'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const schema = {
  rules: [
    {
      matchMdast: matchType('root'),
      component: ({ children }) => children,
    },
  ],
}
const renderSchema = (content) => renderMdast({ ...content }, schema)

export default async function ArticlePage({
  params: { path },
}: {
  params: { path: string[] }
}) {
  const client = await getClient()
  const { data } = await client.query({
    query: ArticleDocument,
    variables: { path: `/${path.join('/')}` },
  })

  if (!data.article) {
    return notFound()
  }

  const {
    article: { meta, content },
  } = data

  return (
    <div>
      <Link href={`/${path.join('/')}`}>Back to legacy article view</Link>
      <h1>{meta.title}</h1>

      <MdastRender mdast={content} />

      {/* <pre>{JSON.stringify(content, null, 2)}</pre> */}
    </div>
  )
}

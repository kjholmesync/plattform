import { ArticleDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { renderMdast } from '@app/lib/mdast/render'
import {
  matchType,
  matchZone,
  matchHeading,
  matchParagraph,
} from '@republik/mdast-react-render'
import { notFound } from 'next/navigation'

const schema = { rules: [] }
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
      <h1>{meta.title}</h1>

      {renderSchema(content)}

      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  )
}

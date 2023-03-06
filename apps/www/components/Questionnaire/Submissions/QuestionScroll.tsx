import React, { useMemo } from 'react'

import { useQuery } from '@apollo/client'
import {
  Loader,
  createArticleSchema,
  Editorial,
  Center,
} from '@project-r/styleguide'

import { CONTENT_FROM_PAGE_QUERY } from './graphql'
import HrefLink from '../../Link/Href'
import { useTranslation } from '../../../lib/withT'

import { renderMdast } from 'mdast-react-render'

type Mdast = {
  identifier?: string
  type?: string
  meta?: object
  children?: Mdast[]
  value?: string
  url?: string
  [x: string]: unknown
}

type QuestionAnswer = {
  content: Mdast
  author: {
    name: string
    credentials: Mdast[]
    pictureUrl: string
  }
}

const groupNodes = (mdast: Mdast[]): Mdast[][] =>
  mdast.reduce((acc: Mdast[][], current: Mdast) => {
    if (!acc.length) return [[current]]
    const lastElement = acc[acc.length - 1]
    const lastIdentifier = lastElement[lastElement.length - 1].identifier
    // new bucket – infobox acts as separator
    if (lastIdentifier === 'INFOBOX') {
      return acc.concat([[current]])
    }
    return acc.map((el, idx, arr) =>
      idx === arr.length - 1 ? el.concat(current) : el,
    )
  }, [])

// the renderer expects a specific mdast structure...
const wrapContent = (mdast: Mdast[]): Mdast => ({
  type: 'root',
  meta: {
    template: 'article',
  },
  children: [{ identifier: 'CENTER', type: 'zone', children: mdast }],
})

const extractData = (mdast: Mdast[]): QuestionAnswer => {
  const infobox = mdast[mdast.length - 1]
  // if we have random crap at the end of the file we ignore it
  if (infobox.identifier !== 'INFOBOX') return

  return {
    content: wrapContent(mdast.slice(0, -1)),
    author: {
      name: infobox.children.find((child) => child.type === 'heading')
        .children[0].value,
      credentials: infobox.children.find((child) => child.type === 'paragraph')
        .children,
      pictureUrl: infobox.children.find(
        (child) => child.identifier === 'FIGURE',
      )?.children[0].children[0].url,
    },
  }
}

const RenderQuestion: React.FC<{ mdast: Mdast[] }> = ({ mdast }) => {
  const { t } = useTranslation()
  const answers: QuestionAnswer[] = useMemo(
    () => groupNodes(mdast).map(extractData).filter(Boolean),
    [mdast],
  )

  const schema = useMemo(
    () =>
      createArticleSchema({
        t,
        Link: HrefLink,
      }),
    [t],
  )

  const renderSchema = (content) =>
    renderMdast(content, schema, {
      MissingNode: () => 'Missing!',
    })

  return (
    <>
      {answers.map(({ content, author }, idx) => (
        <div style={{ marginBottom: 40 }} key={idx}>
          {renderSchema(content)}
          <Center>
            <Editorial.P>*** {author.name} ***</Editorial.P>
          </Center>
        </div>
      ))}
    </>
  )
}

const QuestionScroll: React.FC<{ contentPath: string }> = ({ contentPath }) => {
  const { data, loading, error } = useQuery(CONTENT_FROM_PAGE_QUERY, {
    variables: { path: contentPath },
  })
  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const mdast = data?.document?.content?.children[1].children
        return mdast ? <RenderQuestion mdast={mdast} /> : null
      }}
    />
  )
}

export default QuestionScroll

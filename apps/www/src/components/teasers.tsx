import {
  ARTICLE_QUERY,
  ArticleQueryResult,
} from '@app/graphql/republik-api/article.query'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Link from 'next/link'

type ArticleProps = {
  path: string
}

export const TeaserArticle = async ({ path }: ArticleProps) => {
  const { data }: { data: ArticleQueryResult } = await getClient().query({
    query: ARTICLE_QUERY,
    variables: { path },
  })

  if (!data.article) {
    return null
  }

  return (
    <Link href={path}>
      <div
        className={css({
          padding: '4',
          background: 'challengeAccepted.teaserBackground',
          color: 'text.inverted',
          '&:hover': { transform: 'scale(1.02)' },
        })}
      >
        <p className={css({ textStyle: 'xs' })}>Artikel</p>
        <h3 className={css({ textStyle: 'xl' })}>{data.article?.meta.title}</h3>
        <p className={css({ textStyle: 'sm' })}>
          {data.article?.meta.shortTitle}
        </p>
      </div>
    </Link>
  )
}

type NewsletterProps = {
  repoid: string
}

export const TeaserNewsletter = ({ repoid }: NewsletterProps) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Newsletter</p>
      <h3 className={css({ textStyle: 'xl' })}>{repoid}</h3>
    </div>
  )
}

type EventProps = { title: string }

export const TeaserEvent = ({ title }: EventProps) => {
  return (
    <div
      className={css({
        padding: '4',
        background: 'challengeAccepted.teaserBackground',
        color: 'text.inverted',
      })}
    >
      <p className={css({ textStyle: 'xs' })}>Veranstaltung</p>
      <h3 className={css({ textStyle: 'xl' })}>{title}</h3>
    </div>
  )
}

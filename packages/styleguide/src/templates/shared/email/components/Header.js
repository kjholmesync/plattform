import React, { useMemo } from 'react'
import colors from '../../../../theme/colors'
import { getFormatLine } from '../../../../components/TeaserFeed/utils'
import { matchProjectR } from '../../../EditorialNewsletter/email/project-r/utils'

export default ({ meta }) => {
  const { slug, path, format } = meta

  const isProjectR = matchProjectR(format)

  if (isProjectR) return null

  // support for old format string pending backend change
  // https://github.com/orbiting/backends/compare/feat-article-email
  // specifically resolved meta object
  // https://github.com/orbiting/backends/commit/cce72915353d60c3cd3b4ecafefa3a11fb092933
  const isClimate =
    (typeof format === 'string' &&
      format.includes('format-das-neue-klimaprojekt')) ||
    format?.repoId?.includes('format-das-neue-klimaprojekt')

  const isWdwww =
    (typeof format === 'string' &&
      format.includes('format-was-diese-woche-wichtig-war')) ||
    format?.repoId?.includes('format-was-diese-woche-wichtig-war')

  const width = (isClimate && 179) || 178
  const height = (isClimate && 110) || 79
  const imageFile =
    (isClimate && 'logo_republik_newsletter_climate-1.png') ||
    (isWdwww && 'logo_republik_newsletter_wdwww.png') ||
    'logo_republik_newsletter.png'

  const formatLine = useMemo(() => {
    return getFormatLine({
      format: meta.format,
      series: meta.series,
      repoId: meta.repoId,
      path: meta.path,
    })
  }, [meta])

  const logoLink = (
    <a
      href={`https://www.republik.ch${path ? path : `/${slug}`}`}
      title='Im Web lesen'
    >
      <img
        width={width}
        height={height}
        src={`https://www.republik.ch/static/${imageFile}`}
        style={{
          border: 0,
          width: `${width}px !important`,
          height: `${height}px !important`,
          margin: 0,
          maxWidth: '100% !important',
        }}
        alt='REPUBLIK'
      />
    </a>
  )

  return (
    <>
      <tr>
        <td
          align={isWdwww ? 'left' : 'center'}
          valign='top'
          style={{
            borderBottom:
              formatLine && formatLine.color
                ? `3px solid ${formatLine.color}`
                : `1px solid ${colors.divider}`,
          }}
        >
          {isWdwww ? 'Was diese Woche wichtig war' : logoLink}
        </td>
      </tr>
      {isWdwww && (
        <tr>
          <td align='center'>{logoLink}</td>
        </tr>
      )}
    </>
  )
}

import React from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import compose from 'lodash/flowRight'
import {
  A,
  DEFAULT_PROFILE_PICTURE,
  fontStyles,
  mediaQueries,
  useColorContext,
  renderCommentMdast
} from '@project-r/styleguide'
import { Strong } from './text'
import voteT from './voteT'
import withInNativeApp from '../../lib/withInNativeApp'
import withT from '../../lib/withT'
import Contact from '../Profile/Contact'

const styles = {
  statement: css({
    [mediaQueries.onlyS]: {
      ...fontStyles.serifTitle22
    },
    ...fontStyles.serifTitle26
  }),
  summaryMobile: css({
    display: 'none',
    [mediaQueries.onlyS]: {
      marginBottom: 15,
      display: 'block'
    }
  }),
  detail: css({
    display: 'flex',
    padding: 15,
    margin: '8px 0',
    [mediaQueries.onlyS]: {
      flexDirection: 'column'
    }
  }),
  profile: css({
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'column',
    alignItems: 'start',
    [mediaQueries.onlyS]: {
      flexDirection: 'row',
      marginBottom: 15
    }
  }),
  portrait: css({
    display: 'block',
    backgroundColor: '#E2E8E6',
    width: 100,
    height: 100,
    minWidth: 100,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'grayscale(1)'
  }),
  moreInfo: css({
    marginTop: 15
  }),
  externalLinks: css({
    display: 'flex'
  }),
  shortInfo: css({
    [mediaQueries.onlyS]: {
      paddingLeft: 15
    }
  })
}

const CandidateCard = compose(
  withInNativeApp,
  voteT,
  withT
)(({ inNativeApp, vt, t, candidate, summary, discussionPath }) => {
  const [colorScheme] = useColorContext()
  const target = inNativeApp ? undefined : '_blank'
  const { user: d } = candidate

  return (
    <div {...styles.detail} {...colorScheme.set('backgroundColor', 'alert')}>
      <div {...styles.profile}>
        <div
          style={{
            backgroundImage: `url(${d.portrait || DEFAULT_PROFILE_PICTURE})`
          }}
          {...styles.portrait}
        />
        <div {...styles.shortInfo}>
          <div {...styles.summaryMobile}>{summary}</div>

          {d.username && (
            <>
              <Contact user={d} electionBallot />
              <div style={{ marginTop: 8 }}>
                <Link href={`/~${d.username}`} passHref>
                  <A target={target}>Profil</A>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <div {...styles.statement}>{d.statement || 'Ihr Statement'}</div>
        <div {...styles.biography}>
          {d.biographyContent && renderCommentMdast(d.biographyContent)}
        </div>
        <div>
          {discussionPath && candidate.comment && candidate.comment.id && (
            <div>
              <Link
                href={{
                  pathname: discussionPath,
                  query: {
                    discussion: candidate.election.slug,
                    focus: candidate.comment.id
                  }
                }}
                passHref
              >
                <A target={target}>{vt('vote/election/discussion')}</A>
              </Link>
            </div>
          )}
        </div>
        {d.disclosures && (
          <div {...styles.moreInfo}>
            <Strong>{t('profile/disclosures/label')}:</Strong> {d.disclosures}
          </div>
        )}
        {candidate.recommendation && (
          <div {...styles.moreInfo}>
            <Strong>{vt('vote/election/recommendation')}</Strong>{' '}
            {candidate.recommendation}
          </div>
        )}
      </div>
    </div>
  )
})

export default CandidateCard

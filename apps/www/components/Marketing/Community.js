import {
  Loader,
  CommentTeaser,
  mediaQueries,
  SHARE_IMAGE_WIDTH,
  SHARE_IMAGE_HEIGHT,
} from '@project-r/styleguide'
import { css } from 'glamor'

import SectionTitle from './Common/SectionTitle'
import SectionContainer from './Common/SectionContainer'
import CommentLink from '../Discussion/shared/CommentLink'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import { useTranslation } from '../../lib/withT'

const Community = ({ loading, error, featuredComments }) => {
  const { t } = useTranslation()
  return (
    <SectionContainer>
      <SectionTitle
        title={t('marketing/page/community/title')}
        lead={t('marketing/page/community/lead')}
      />
      <Loader
        loading={loading}
        error={error}
        style={{ minHeight: 400 }}
        render={() => (
          <div {...styles.row}>
            {featuredComments.nodes.map((comment) => {
              const image =
                comment.discussion?.document?.meta?.image ||
                (comment.discussion?.document?.meta?.shareText
                  ? `${ASSETS_SERVER_BASE_URL}/render?width=${SHARE_IMAGE_WIDTH}&height=${SHARE_IMAGE_HEIGHT}&updatedAt=${encodeURIComponent(
                      `${comment.discussion.document.id}${
                        comment.discussion.document.meta.format
                          ? `-${comment.discussion.document.meta.format.id}`
                          : ''
                      }`,
                    )}&url=${encodeURIComponent(
                      `${PUBLIC_BASE_URL}${comment.discussion.document.meta.path}?extract=share`,
                    )}`
                  : undefined)

              return (
                <div {...styles.comment} key={comment.id}>
                  <CommentTeaser
                    {...{
                      ...comment,
                      discussion: {
                        ...comment.discussion,
                        image,
                      },
                    }}
                    CommentLink={CommentLink}
                    t={t}
                  />
                </div>
              )
            })}
          </div>
        )}
      />
    </SectionContainer>
  )
}

const styles = {
  row: css({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 1280,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }),
  comment: css({
    margin: '0 auto',
    width: '100%',
    maxWidth: 500,
    padding: 0,
    [mediaQueries.mUp]: {
      width: '50%',
      padding: '0 15px',
    },
  }),
}

export default Community

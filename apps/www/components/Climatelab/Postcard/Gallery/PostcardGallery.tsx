import { withDefaultSSR } from '../../../../lib/apollo/helpers'
import { gql, useQuery } from '@apollo/client'
import { FigureImage } from '@project-r/styleguide'
import { CDN_FRONTEND_BASE_URL } from '../../../../lib/constants'

import AssetImage from '../../../../lib/images/AssetImage'

import { css } from 'glamor'
import { useMemo, useState } from 'react'

import { Overlay, OverlayToolbar, OverlayBody } from '@project-r/styleguide'
import { PostcardPreview } from '../PostcardPreview'

/**
 * TODO: Resolve user profiles for linked
 * TODO: How does pagination work here?
 * TODO: Replace getResizedSrcs with new AssetImage
 *
 */

const POSTCARDS_QUERY = gql`
  query publicPostcardsQuery {
    questionnaire(slug: "klima-postkarte") {
      questions {
        id
        ... on QuestionTypeImageChoice {
          options {
            value
            imageUrl
          }
        }
      }

      submissions {
        totalCount
        nodes {
          id
          answers {
            nodes {
              id
              payload
              question {
                id
                ... on QuestionInterface {
                  id
                  __typename
                  text
                }
              }
            }
          }
        }
      }
    }
  }
`

// deprecated?
// type ImageSrcData = {
//   src: string
//   dark: null
//   srcSet: string
//   maxWidth: number
//   size: { width: number; height: number }
// }

type Postcard = {
  id: string
  text: string
  isHighlighted: boolean
  imageUrl: string
  imageSelection: string
  // profileInfo: TODO
}

type PostcardsData =
  | {
      _state: 'LOADING'
    }
  | { _state: 'ERROR' }
  | {
      _state: 'LOADED'
      postcards: Postcard[]
    }

/**
 *
 * TODO: Proper loading/error state
 *
 */
const usePostcardsData = (): PostcardsData => {
  const { data, loading, error } = useQuery(POSTCARDS_QUERY)

  if (error) {
    return { _state: 'ERROR' }
  }

  if (loading) {
    return {
      _state: 'LOADING',
    }
  }

  // Fugly parsing!
  // FIXME: add stricter types
  const postcards = data.questionnaire?.submissions?.nodes.map((submission) => {
    const imageAnswer = submission.answers.nodes?.[0]?.payload?.value?.[0]
    const imageUrl = data.questionnaire?.questions?.[0]?.options?.find(
      ({ value }) => value === imageAnswer,
    )?.imageUrl
    const text = submission.answers.nodes?.[1]?.payload?.value

    const image = FigureImage.utils.getResizedSrcs(
      `${CDN_FRONTEND_BASE_URL}${imageUrl}?size=1500x1057`, // FIXME: use correct/consistent size for all images
      undefined,
      1500,
    )

    return {
      id: submission.id,
      text,
      image,
    }
  })

  return { _state: 'LOADED', postcards }
}

const useMockPostcardsData = (): PostcardsData => {
  const images = [
    '/static/climatelab/freier.jpg',
    '/static/climatelab/farner.jpg',
    '/static/climatelab/richardson.jpg',
    '/static/climatelab/zalko.jpg',
  ]

  const postcards = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const imageUrl = images[Math.floor(Math.random() * 4)]
      const isHighlighted = i % 10 === 0
      return {
        id: `img-${i}`,
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
        imageSelection: 'postcard_1',
        isHighlighted,
        imageUrl,
      }
    })
  }, [])

  return { _state: 'LOADED', postcards }
}

const gridStyles = {
  container: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gridTemplateRows: 'auto',
    gridAutoFlow: 'row dense',
    gap: '1rem',
  }),
  card: css({
    background: 'hotpink',
    width: '100%',
    gridRowEnd: 'span 1',
    gridColumnEnd: 'span 1',
  }),
  highlightedCard: css({
    background: 'hotpink',
    width: '100%',
    // border: '2px solid pink',
    gridRowEnd: 'span 3',
    gridColumnEnd: 'span 3',
  }),
}

const PostcardsGrid = ({
  postcards,
  onToggleOverlay,
}: {
  postcards: Postcard[]
  onToggleOverlay: (a?: object) => void
}) => {
  return (
    <div {...gridStyles.container}>
      {postcards.map((p) => {
        const cardStyle = p.isHighlighted
          ? gridStyles.highlightedCard
          : gridStyles.card

        return (
          <div key={p.id} {...cardStyle} onClick={() => onToggleOverlay(p)}>
            {p.isHighlighted ? (
              <PostcardPreview postcard={p} />
            ) : (
              <AssetImage width='600' height='420' src={p.imageUrl} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PostcardGallery() {
  // const postcardsData = usePostcardsData()
  const postcardsData = useMockPostcardsData()

  const [toggleOverlay, setToggleOverlay] = useState({ isOpen: false })
  const [overlayBody, setOverlayBody] = useState()

  const onOverlayToggeled = (content) => {
    setToggleOverlay({ isOpen: toggleOverlay.isOpen ? false : true })
    setOverlayBody(content)
  }

  return postcardsData._state === 'LOADED' ? (
    <>
      <PostcardsGrid
        postcards={postcardsData.postcards}
        onToggleOverlay={onOverlayToggeled}
      />
      {toggleOverlay.isOpen && (
        <Overlay
          onClose={() => {
            setToggleOverlay({ isOpen: false })
          }}
        >
          <OverlayToolbar
            onClose={() => {
              setToggleOverlay({ isOpen: false })
            }}
          />
          <OverlayBody>
            <PostcardPreview postcard={overlayBody} />
          </OverlayBody>
        </Overlay>
      )}
    </>
  ) : (
    <div>whoops</div>
  )
}

export default PostcardGallery

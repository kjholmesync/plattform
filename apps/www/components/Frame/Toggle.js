import { useMemo } from 'react'
import {
  CloseIcon,
  MicIcon,
  mediaQueries,
  plainButtonRule,
  useColorContext,
  fontStyles,
} from '@project-r/styleguide'
import { css } from 'glamor'
import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_MOBILE,
  HEADER_HORIZONTAL_PADDING,
  ZINDEX_FRAME_TOGGLE,
  TRANSITION_MS,
} from '../constants'
import useAudioQueue from '../Audio/hooks/useAudioQueue'
import { useAudioContext } from '../Audio/AudioProvider'
import { trackEvent } from '../../lib/matomo'

const SIZE = 28
const PADDING_MOBILE = Math.floor((HEADER_HEIGHT_MOBILE - SIZE) / 2)
const PADDING_DESKTOP = Math.floor((HEADER_HEIGHT - SIZE) / 2)

const Toggle = ({ expanded, closeOverlay, ...props }) => {
  const [colorScheme] = useColorContext()
  const { audioQueue, isAudioQueueAvailable } = useAudioQueue()
  const {
    audioPlayerVisible,
    setAudioPlayerVisible,
    isPlaying,
    isExpanded: audioPlayerExpanded,
    setIsExpanded: setAudioPlayerExpanded,
  } = useAudioContext()
  const audioItemsCount = audioQueue?.length

  const onClick = () => {
    if (expanded) {
      return closeOverlay && closeOverlay()
    }
    // handle close audio player
    if (audioPlayerVisible && audioPlayerExpanded) {
      if (isPlaying) {
        setAudioPlayerExpanded(false)
      } else {
        setAudioPlayerVisible(false)
      }
    }
    // expand mini-player or player if not visible yet
    if (!audioPlayerExpanded) {
      setAudioPlayerExpanded(true)
    }
    // make visible if previously hidden
    if (!audioPlayerVisible) {
      trackEvent(['Navigation', 'toggleAudioPlayer', audioItemsCount])
      setAudioPlayerVisible(true)
    }
  }

  return expanded || isAudioQueueAvailable ? (
    <button {...styles.menuToggle} onClick={onClick} {...props}>
      <div style={{ opacity: !expanded ? 1 : 0 }} {...styles.audioButton}>
        <MicIcon {...colorScheme.set('fill', 'text')} size={SIZE} />
        {!!audioItemsCount && (
          <span
            {...colorScheme.set('background', 'default')}
            {...colorScheme.set('color', 'text')}
            {...styles.audioCount}
          >
            {audioItemsCount}
          </span>
        )}
      </div>
      <CloseIcon
        style={{ opacity: expanded ? 1 : 0 }}
        {...styles.closeButton}
        {...colorScheme.set('fill', 'text')}
        size={SIZE}
      />
    </button>
  ) : null
}

const styles = {
  menuToggle: css(plainButtonRule, {
    cursor: 'pointer',
    zIndex: ZINDEX_FRAME_TOGGLE,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    padding: PADDING_MOBILE,
    position: 'relative',
    // Additional 4 px to account for scrollbar
    paddingRight: HEADER_HORIZONTAL_PADDING + 4,
    lineHeight: 0,
    [mediaQueries.mUp]: {
      padding: PADDING_DESKTOP,
    },
  }),
  audioCount: css({
    ...fontStyles.sansSerifMedium,
    position: 'absolute',
    fontSize: 10,
    top: 15,
    left: 30,
    [mediaQueries.mUp]: {
      top: 22,
      left: 36,
    },
  }),
  audioButton: css({
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  }),
  closeButton: css({
    position: 'absolute',
    // Additional 4 px to account for scrollbar
    right: HEADER_HORIZONTAL_PADDING + 4,
    top: PADDING_MOBILE,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
    [mediaQueries.mUp]: {
      top: PADDING_DESKTOP,
    },
  }),
}

export default Toggle

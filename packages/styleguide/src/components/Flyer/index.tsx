import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { Message } from '../Editor/Render/Message'
import renderAsText from '../Editor/Render/text'
import { CustomDescendant } from '../Editor/custom-types'
import { isSlateElement } from '../Editor/Render/helpers'

const MAX_CHAR = 600
export const FLYER_CONTAINER_MAXWIDTH = 700

const styles = {
  container: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  }),
  content: css({
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    margin: '0 auto',
    padding: '50px 15px',
    [mUp]: {
      padding: '90px 0',
    },
    '& > :last-child': {
      marginBottom: '0 !important',
    },
  }),
  contentOpening: css({
    marginBottom: -72,
    [mUp]: {
      marginBottom: -144,
    },
  }),
}

export const FlyerTile: React.FC<{
  attributes: any
  innerStyle?: object
  [x: string]: unknown
}> = ({ children, attributes, innerStyle = {}, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
      {...colorScheme.set('background', 'flyerBg')}
    >
      <div {...styles.content} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}

export const FlyerTileOpening: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...colorScheme.set('background', 'flyerBg')}
    >
      <div {...styles.content} {...styles.contentOpening}>
        {children}
      </div>
    </div>
  )
}

export const EditorFlyerTile: React.FC<{
  slatechildren: CustomDescendant[]
  attributes: any
  [x: string]: unknown
}> = ({ children, slatechildren = [], attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const charCount = useMemo(() => {
    const tree = slatechildren.filter(
      (n) => isSlateElement(n) && n.type !== 'flyerMetaP',
    )
    return renderAsText(tree).length
  }, [slatechildren])
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      <Message
        text={`${charCount} Zeichen`}
        type={charCount > MAX_CHAR ? 'error' : 'info'}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
        }}
      />
      <div {...styles.content}>{children}</div>
    </div>
  )
}

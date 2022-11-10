import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import {
  serifTitle20,
  serifTitle22,
  sansSerifMedium20,
  sansSerifMedium22,
  cursiveTitle20,
  cursiveTitle22,
  flyerTitle16,
  flyerTitle18,
} from '../Typography/styles'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  base: css({
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8,
    },
  }),
  editorial: css({
    ...convertStyleToRem(serifTitle20),
    [mUp]: {
      ...convertStyleToRem(serifTitle22),
    },
  }),
  interaction: css({
    ...convertStyleToRem(sansSerifMedium20),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium22),
      lineHeight: pxToRem(24),
    },
  }),
  scribble: css({
    ...convertStyleToRem(cursiveTitle20),
    [mUp]: {
      ...convertStyleToRem(cursiveTitle22),
    },
  }),
  flyer: css({
    ...convertStyleToRem(flyerTitle16),
    [mUp]: {
      ...convertStyleToRem(flyerTitle18),
    },
  }),
}

export const Editorial = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.editorial}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

export const Interaction = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.interaction}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

export const Scribble = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.scribble}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

export const Flyer = ({ children, formatColor }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...styles.base}
      {...styles.flyer}
      {...colorScheme.set('color', formatColor || 'text', 'format')}
    >
      {children}
    </h1>
  )
}

import React from 'react'
import { css, merge, simulate } from 'glamor'
import colors from '../../theme/colors'
import { fontFamilies } from '../../theme/fonts'
import { pxToRem } from '../Typography/utils'

export const plainButtonRule = css({
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  outline: 'none',
  appearance: 'none',
  padding: 0
})

const buttonStyle = css(plainButtonRule, {
  display: 'inline-block',
  verticalAlign: 'middle',
  padding: '10px 20px 10px 20px',
  minWidth: 160,
  textAlign: 'center',
  textDecoration: 'none',
  fontSize: pxToRem(22),
  lineHeight: 1.5,
  height: pxToRem(60),
  boxSizing: 'border-box',
  backgroundColor: '#fff',
  fontFamily: fontFamilies.sansSerifRegular,
  border: `1px solid ${colors.secondary}`,
  borderRadius: 0,
  color: colors.secondary,
  '@media (hover)': {
    ':hover': {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      color: '#fff'
    }
  },
  ':active': {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
    color: '#fff'
  },
  ':disabled, [disabled]': {
    backgroundColor: '#fff',
    color: colors.disabled,
    borderColor: colors.disabled,
    cursor: 'default'
  }
})
const primaryStyle = css({
  backgroundColor: colors.primary,
  borderColor: colors.primary,
  color: '#fff',
  '@media (hover)': {
    ':hover': {
      backgroundColor: colors.secondary,
      borderColor: colors.secondary
    },
  },
  ':active': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  }
})
const dimmedStyle = css({
  backgroundColor: '#fff',
  color: colors.disabled,
  borderColor: colors.disabled
})
const blackStyle = css({
  backgroundColor: 'transparent',
  borderColor: '#000',
  color: '#000',
  '@media (hover)': {
    ':hover': {
      backgroundColor: '#000',
      borderColor: '#000',
      color: '#fff'
    },
  },
  ':active': {
    backgroundColor: '#000',
    borderColor: '#000',
    color: '#fff'
  }
})
const whiteStyle = css({
  backgroundColor: 'transparent',
  borderColor: '#fff',
  color: '#fff',
  '@media (hover)': {
    ':hover': {
      backgroundColor: '#fff',
      borderColor: '#fff',
      color: '#000'
    },
  },
  ':active': {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: '#000'
  }
})
const blockStyle = css({
  display: 'block',
  width: '100%'
})
const bigStyle = css({
  fontSize: pxToRem(22),
  height: pxToRem(80),
  padding: '10px 30px 10px 30px'
})

const spacedOutStyle = css({
  margin: '0 10px 10px 0',
  ':first-of-type': {
    marginLeft: 0
  },
})

const Button = ({
  onClick, type, children, primary, dimmed, black, white, spacedOut,
  big, block, style, disabled, href, title, target, simulate: sim, attributes
}) => {
  const simulations = sim ? simulate(sim) : {}
  const styles = merge(
    buttonStyle,
    primary && primaryStyle,
    dimmed && dimmedStyle,
    black && blackStyle,
    white && whiteStyle,
    block && blockStyle,
    big && bigStyle,
    spacedOut && !block && spacedOutStyle
  )

  const Element = href ? 'a' : 'button'

  return (
    <Element onClick={onClick}
             href={href}
             title={title}
             type={type}
             style={style}
             disabled={disabled}
             target={target}
             {...attributes}
             {...styles}
             {...simulations}>
      {children}
    </Element>)
}

export default Button

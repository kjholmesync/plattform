import React from 'react'
import { css } from 'glamor'

const defaultGetWidth = () => '100%'

const GUTTER = 20
const styles = {
  grid: css({
    clear: 'both',
    width: `calc(100% + ${GUTTER}px)`,
    margin: `0 -${GUTTER / 2}px`,
    ':after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  }),
  span: css({
    float: 'left',
    paddingLeft: `${GUTTER / 2}px`,
    paddingRight: `${GUTTER / 2}px`,
    minHeight: 1,
    width: '50%'
  })
}

export default ({ children, getWidth = defaultGetWidth, ...props }) => {
  const childComponents = Array.isArray(children)
    ? children
    : Array.of(children)
  const wrappedChildren = childComponents.map(
    (child, index) => (
      <div
        key={`input-${index}`}
        {...styles.span}
        style={{width: getWidth()}}>
        {child}
      </div>
    )
  )
  return (
    <div {...styles.grid}>
      {wrappedChildren}
    </div>
  )
}

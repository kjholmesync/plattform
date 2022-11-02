import React from 'react'
import { FigureImages } from '../Editor/custom-types'
import {
  Figure as InnerFigure,
  FigureImage as InnerFigureImage,
  FigureByline as InnerByline,
} from './index'
import { getResizedSrcs } from './utils'
import { FLYER_CONTAINER_MAXWIDTH } from '../Flyer'

export const PLACEHOLDER = '/static/placeholder.png'

export const FigureByline: React.FC<{
  children: any
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  return (
    <InnerByline attributes={attributes} {...props} style={{ marginLeft: 4 }}>
      {children}
    </InnerByline>
  )
}

// TODO: get max width from render context
export const FigureImage: React.FC<{
  images?: FigureImages
  alt?: string
  attributes: any
  [x: string]: unknown
}> = ({ children, images, alt, attributes, ...props }) => {
  return (
    <div {...attributes} {...props}>
      <div contentEditable={false}>
        <InnerFigureImage
          {...getResizedSrcs(
            images?.default?.url || PLACEHOLDER,
            images?.dark?.url,
            FLYER_CONTAINER_MAXWIDTH,
          )}
          alt={alt}
        />
      </div>
      {children}
    </div>
  )
}

export const Figure: React.FC<{
  children: any
  size: string
  attributes: any
  [x: string]: unknown
}> = ({ children, size, attributes = {} }) => {
  return (
    <InnerFigure attributes={attributes} size={size}>
      {children}
    </InnerFigure>
  )
}

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { css } from 'glamor'
import questionStyles from './../../Questionnaire/questionStyles'
import { nest } from 'd3-collection'
import uuid from 'uuid/v4'
import { Loader } from '@project-r/styleguide'
import scrollIntoView from 'scroll-into-view'

import {
  Interaction,
  useColorContext,
  mediaQueries,
} from '@project-r/styleguide'
import dynamic from 'next/dynamic'
const { H2 } = Interaction

const styles = {
  container: css({
    width: '100%',
    position: 'relative',
  }),
  carousel: css({
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    display: 'flex',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  slide: css({
    scrollSnapAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'space-around',
    minWidth: '85%',
    maxHeight: '400px',
    overflowY: 'hidden',
    position: 'relative',
    zIndex: 1,
    paddingLeft: 15,
    '&:last-child': {
      paddingRight: 15,
    },
    '&:first-child': {
      paddingLeft: 0,
    },
  }),
  image: css({
    width: '100%',
    userSelect: 'none',
  }),
  actions: css({
    marginTop: '16px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    userSelect: 'none',
  }),
  clickArea: css({
    position: 'absolute',
    cursor: 'pointer',
    width: 30,
    height: '100%',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [mediaQueries.mUp]: {
      width: 100,
    },
  }),
}

const LoadingComponent = () => <Loader loading />

const ImageChoice = dynamic(() => import('./ImageChoice'), {
  loading: LoadingComponent,
  ssr: false,
})

const ImageChoiceQuestion = (props) => {
  const [answerId, setAnswerId] = useState(
    (props.question.userAnswer && props.question.userAnswer.id) || uuid(),
  )
  const {
    question: { text, userAnswer, options },
  } = props

  const handleChange = (value) => {
    const {
      onChange,
      question: { userAnswer },
    } = props
    const nextValue = new Set(userAnswer ? userAnswer.payload.value : [])

    nextValue.clear()
    nextValue.add(value)

    onChange(answerId, Array.from(nextValue))
  }

  const optionGroups = nest()
    .key((o) => o.category)
    .entries(options)
  const userAnswerValues = userAnswer ? userAnswer.payload.value : []

  // image carousel stuff
  const carouselRef = useRef()
  const [colorScheme] = useColorContext()

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [disableScrollIntoView, setDisableScrollIntoView] = useState(false)
  const [disableScrollListener, setDisableScrollListener] = useState(false)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel || disableScrollListener) {
      return
    }
    const onScroll = () => {
      setDisableScrollIntoView(true)
      const slideWidth = carousel.scrollWidth / options.length

      const newIndex = Math.floor(
        (slideWidth / 2 + carousel.scrollLeft) / slideWidth,
      )
      if (newIndex !== currentSlideIndex) {
        setCurrentSlideIndex(newIndex)
      }
    }
    carousel.addEventListener('scroll', onScroll)
    return () => {
      carousel.removeEventListener('scroll', onScroll)
    }
  }, [currentSlideIndex, disableScrollListener])

  useEffect(() => {
    if (disableScrollIntoView) {
      return
    }
    const target = Array.from(carouselRef.current.children)[currentSlideIndex]
    carouselRef.current.style.scrollSnapType = 'none'
    scrollIntoView(
      target,
      {
        time: 300,
        align: {
          lockY: true,
        },
      },
      function () {
        carouselRef.current.style.scrollSnapType = 'x mandatory'
        setDisableScrollListener(false)
      },
    )
  }, [currentSlideIndex, disableScrollIntoView])

  const handleClick = (index) => {
    setDisableScrollIntoView(false)
    setDisableScrollListener(true)
    setCurrentSlideIndex(index)
  }

  const forwardDisabled = currentSlideIndex + 1 === options.length
  const backwardDisabled = currentSlideIndex === 0

  const clickAreaGradient = useMemo(
    () =>
      css({
        background: colorScheme.getCSSColor('fadeOutGradientDefault90'),
      }),
    [colorScheme],
  )

  return (
    <>
      <div {...questionStyles.label}>{text && <H2>{text}</H2>}</div>
      <div {...styles.container}>
        <div
          {...styles.clickArea}
          {...clickAreaGradient}
          style={{
            left: '-1px',
            pointerEvents: backwardDisabled ? 'none' : undefined,
            display: backwardDisabled && 'none',
          }}
          onClick={() => handleClick(currentSlideIndex - 1)}
        >
          <svg
            style={{ display: backwardDisabled && 'none' }}
            width='16'
            height='40'
            viewBox='0 0 21 80'
            fill='none'
          >
            <path
              d='M18.5 1L3 41L18.5 79'
              {...colorScheme.set('stroke', 'text')}
              strokeWidth='4'
            />
          </svg>
        </div>
        <div
          {...styles.clickArea}
          {...clickAreaGradient}
          style={{
            right: '-1px',
            pointerEvents: forwardDisabled ? 'none' : undefined,
            display: forwardDisabled && 'none',
            transform: 'rotate(-180deg)',
          }}
          onClick={() => handleClick(currentSlideIndex + 1)}
        >
          <svg
            style={{
              display: forwardDisabled && 'none',
            }}
            width='16'
            height='40'
            viewBox='0 0 21 80'
            fill='none'
          >
            <path
              d='M18.5 1L3 41L18.5 79'
              {...colorScheme.set('stroke', 'text')}
              strokeWidth='4'
            />
          </svg>
        </div>
        <div {...styles.carousel} ref={carouselRef}>
          {optionGroups.map(({ key, values }) =>
            values.map((o, i) => (
              <div key={i} {...styles.slide}>
                <ImageChoice
                  onChange={() => handleChange(o.value)}
                  checked={userAnswerValues.some((v) => v === o.value)}
                  imageUrl={o.imageUrl}
                >
                  {o.label}
                </ImageChoice>
              </div>
            )),
          )}
        </div>
      </div>
    </>
  )
}

export default ImageChoiceQuestion

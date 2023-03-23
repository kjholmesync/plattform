import { ReactNode, useRef, useEffect } from 'react'
import { useScroll } from 'framer-motion'
import { css } from 'glamor'
import { TRANSITION } from './config'
import { useMediaQuery, mediaQueries } from '@project-r/styleguide'

export const ScrollySlide = ({
  children,
  highlighted,
  onChangeInView,
}: {
  children: ReactNode
  highlighted?: boolean
  onChangeInView: (inView: boolean) => void
}) => {
  const ref = useRef(null)
  const largeScreen = useMediaQuery(mediaQueries.lUp)
  // const isInView = useInView(ref, { amount: 0.5, margin: '-30% 0px 0px 0px' }) // FIXME margin top should be correct bottom of graphic
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 60vh'],
  })

  useEffect(() => {
    const doSomething = (value) => {
      if (value >= 1) {
        onChangeInView(true)
      } else {
        onChangeInView(false)
      }
    }

    const unsubY = scrollYProgress.onChange(doSomething)

    return () => {
      unsubY()
    }
  }, [scrollYProgress])

  return (
    <section
      ref={ref}
      {...styles.scrollySlide}
      style={{ opacity: highlighted ? 1 : 0.5 }}
    >
      {children}
    </section>
  )
}

const styles = {
  scrollySlide: css({
    transition: TRANSITION,
    maxWidth: '43rem',
    margin: '0 auto',
    marginTop: '5vh',
    '&:first-of-type': { marginTop: '15vh' },
  }),
}

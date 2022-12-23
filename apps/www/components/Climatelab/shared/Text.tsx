import { FC } from 'react'
import { fontStyles } from '@project-r/styleguide'
import { ClimatelabColors } from '../ClimatelabColors'
import { css } from 'glamor'

const Text: FC = ({ children }) => <p {...style}>{children}</p>

export default Text

const style = css({
  ...fontStyles.sansSerifMedium,
  fontSize: 30,
  color: ClimatelabColors.text,
})

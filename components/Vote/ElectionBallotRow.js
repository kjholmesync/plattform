import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  Checkbox,
  fontStyles,
  mediaQueries,
  Radio
} from '@project-r/styleguide'
import { Strong } from './text'
import {
  FavoriteIcon,
  StarsIcon,
  ChevronRightIcon
} from '@project-r/styleguide/icons'
import CandidateCard from './CandidateCard'

const styles = {
  row: css({
    width: '100%',
    marginBottom: 8,
    [mediaQueries.mUp]: {
      marginBottom: 15
    }
  }),
  summary: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...fontStyles.sansSerifRegular16,
    lineHeight: 1.3,
    overflowWrap: 'break-word'
  }),
  summaryInfo: css({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  }),
  summaryDetail: css({
    [mediaQueries.mUp]: {
      display: 'inline-block'
    }
  }),
  summaryDesktop: css({
    [mediaQueries.onlyS]: {
      display: 'none'
    }
  }),
  icon: css({
    marginLeft: 'auto',
    ...fontStyles.serifTitle22,
    transition: 'transform 0.3s',
    display: 'flex',
    '& :not(:first-child)': {
      marginLeft: 8
    }
  }),
  selection: css({
    marginLeft: 24
  })
}

const ElectionBallotRow = props => {
  const [expanded, setExpanded] = useState(props.expanded || false)
  const {
    candidate,
    maxVotes,
    selected,
    onChange,
    disabled,
    mandatory,
    showMeta,
    discussionPath,
    discussionTag
  } = props

  const toggleExpanded = e => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(expanded => !expanded)
  }

  const SelectionComponent = maxVotes > 1 ? Checkbox : Radio

  const { user: d } = candidate
  const summary = [candidate.yearOfBirth, d.gender, candidate.city].filter(
    Boolean
  )
  const showSummary = !!summary.length

  const isDisabled = maxVotes > 1 && !selected && disabled

  return (
    <div {...styles.row}>
      <div {...styles.summary}>
        <div {...styles.summaryInfo} onClick={toggleExpanded}>
          <div
            {...styles.icon}
            style={{ transform: expanded && 'rotate(90deg)' }}
          >
            <ChevronRightIcon />
          </div>
          <div>
            <Strong>
              {d.name}
              {candidate.isIncumbent ? ' (bisher)' : ''}
            </Strong>
            {showSummary && <span {...styles.summaryDesktop}>,&nbsp;</span>}
            {showSummary && (
              <div {...styles.summaryDetail}>{summary.join(', ')}</div>
            )}
          </div>
        </div>
        {showMeta && (
          <div {...styles.icon}>
            {candidate.recommendation && <StarsIcon />}
            {mandatory && <FavoriteIcon />}
          </div>
        )}
        {onChange && (
          <div {...styles.selection}>
            <SelectionComponent
              disabled={isDisabled}
              checked={selected}
              onChange={() => onChange(candidate)}
            />
          </div>
        )}
      </div>
      {expanded && (
        <CandidateCard
          candidate={candidate}
          discussionPath={discussionPath}
          discussionTag={discussionTag}
        />
      )}
    </div>
  )
}

ElectionBallotRow.propTypes = {
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  maxVotes: PropTypes.number,
  expanded: PropTypes.bool,
  onChange: PropTypes.func,
  candidate: PropTypes.object.isRequired,
  showMeta: PropTypes.bool,
  discussionPath: PropTypes.string,
  discussionTag: PropTypes.string
}

ElectionBallotRow.defaultProps = {
  selected: false,
  disabled: false,
  maxVotes: 1,
  expanded: false,
  showMeta: true
}

export default ElectionBallotRow

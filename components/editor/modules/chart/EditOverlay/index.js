import React, { useState } from 'react'
import OverlayFormManager from '../../../utils/OverlayFormManager'
import Export from '../Export'
import ChartEditor from './ChartEditor'
import ChartSelector from './ChartSelector'
import { plainButtonRule, fontStyles } from '@project-r/styleguide'
import { css } from 'glamor'

const tabs = ['chart', 'templates']
const tabConfig = {
  chart: { body: ChartEditor, label: 'Chart', showPreview: true },
  templates: { body: ChartSelector, label: 'Vorlagen', showPreview: false }
}

const styles = {
  tabContainer: css({
    height: '100%',
    display: 'flex',
    lineHeight: '16px'
  }),
  tab: css({
    margin: '0 15px',
    '@media (hover)': {
      ':hover': {
        textDecoration: 'underline',
        textDecorationSkip: 'ink'
      }
    },
    '&.is-active': {
      ...fontStyles.sansSerifMedium,
      lineHeight: '16px'
    }
  })
}

const Tab = ({ tabKey, setTab, isActive }) => {
  return (
    <button
      {...plainButtonRule}
      {...styles.tab}
      onClick={() => setTab(tabKey)}
      className={isActive ? 'is-active' : ''}
    >
      {tabConfig[tabKey].label}
    </button>
  )
}

const hasData = node =>
  node.data.get('config')?.type || node.data.get('values') != ''

export default props => {
  const [tab, setTab] = useState(hasData(props.node) ? 'chart' : 'templates')
  const overlayToolBarActions = (
    <div {...styles.tabContainer}>
      {tabs.map(tabKey => (
        <Tab
          key={tabKey}
          tabKey={tabKey}
          setTab={setTab}
          isActive={tab === tabKey}
        />
      ))}
    </div>
  )
  const TabBody = tabConfig[tab].body

  return (
    <OverlayFormManager
      {...props}
      overlayToolBarActions={overlayToolBarActions}
      showPreview={tabConfig[tab].showPreview}
      extra={<Export chart={props.preview} />}
      onChange={data => {
        props.editor.change(change => {
          const size = data.get('config', {}).size
          const parent = change.value.document.getParent(props.node.key)
          if (size !== parent.data.get('size')) {
            change.setNodeByKey(parent.key, {
              data: parent.data.set('size', size)
            })
          }
          change.setNodeByKey(props.node.key, {
            data
          })
        })
      }}
    >
      {({ data, onChange }) => (
        <TabBody
          data={data}
          onChange={onChange}
          CsvChart={props.CsvChart}
          setTab={setTab}
        />
      )}
    </OverlayFormManager>
  )
}

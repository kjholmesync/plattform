import { withRouter } from 'next/router'
import {
  flyerSchema,
  RenderContextProvider,
  timeFormat,
  FlyerDate,
} from '@project-r/styleguide'
import {
  Editor,
  flyerEditorSchema,
  FLYER_DATE_FORMAT,
} from '@project-r/styleguide/editor'
import withAuthorization from '../../components/Auth/withAuthorization'
import { HEADER_HEIGHT } from '../Frame/constants'
import compose from 'lodash/flowRight'
import withT from '../../lib/withT'

export const getInitialValue = (options) => {
  const date = options?.publishDate
    ? { date: timeFormat(FLYER_DATE_FORMAT)(new Date(options?.publishDate)) }
    : {}
  return [
    {
      type: 'flyerTileOpening',
      children: [
        {
          type: 'flyerDate',
          children: [{ text: '' }],
          ...date,
        },
        {
          type: 'headline',
          children: [
            { text: 'Guten Tag,' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'schön sind Sie da.' },
          ],
        },
      ],
    },
    {
      type: 'flyerTileClosing',
      children: [
        {
          type: 'headline',
          children: [{ text: 'Danke fürs Interesse.' }],
        },
        {
          type: 'flyerSignature',
          children: [
            {
              text: 'Ihre Crew der Republik',
            },
          ],
        },
      ],
    },
  ]
}

const STRUCTURE = [
  {
    type: 'flyerTileOpening',
  },
  {
    type: ['flyerTile', 'flyerTileMeta'],
    repeat: true,
  },
  {
    type: 'flyerTileClosing',
  },
]

export const editorToolbarStyle = { top: HEADER_HEIGHT }

const TOOLBAR = {
  style: editorToolbarStyle,
  showChartCount: true,
}

const Index = ({ value, publishDate, onChange, readOnly, t }) => {
  const nav = <FlyerDate date={publishDate} />
  return (
    <RenderContextProvider t={t} nav={nav}>
      {/* The Editor does its own RenderContextProvider
       * but we also need to do one from the main styleguide entry point
       * cause render components will use that context
       */}
      <Editor
        value={value}
        setValue={(newValue) => {
          onChange(newValue)
        }}
        structure={STRUCTURE}
        config={{
          schema: flyerSchema,
          editorSchema: flyerEditorSchema,
          toolbar: TOOLBAR,
          readOnly,
          t,
          nav,
        }}
      />
    </RenderContextProvider>
  )
}

export default compose(withT, withRouter, withAuthorization(['editor']))(Index)

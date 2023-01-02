import React, { useCallback, useEffect } from 'react'
import { createEditor, Editor, Text } from 'slate'
import { withHistory } from 'slate-history'
import { Slate, Editable, withReact } from 'slate-react'
import { useMemoOne } from 'use-memo-one'
import { withNormalizations } from './decorators/normalization'
import { withElAttrsConfig } from './decorators/attrs'
import Footer from './Footer'
import { FormContextProvider, FormOverlay } from './Forms'
import Toolbar from './Toolbar'
import { LeafComponent } from './Mark'
import {
  CustomDescendant,
  CustomEditor,
  EditorConfig,
  NodeTemplate,
} from '../custom-types'
import { NAV_KEYS, navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { withInsert } from './decorators/insert'
import { withDelete } from './decorators/delete'
import { withCustomConfig } from './decorators/config'
import { LayoutContainer } from '../Render/Containers'
import {
  flagChars,
  getCharCount,
  ERROR_CHARS,
  INVISIBLE_CHARS,
} from './helpers/text'
import { RenderContextProvider } from '../Render/Context'
import { ElementComponent } from './Element'

export type SlateEditorProps = {
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  editor?: CustomEditor
  config: EditorConfig
}

const SlateEditor: React.FC<SlateEditorProps> = ({
  value,
  setValue,
  structure,
  editor: mockEditor,
  config,
}) => {
  const editor = useMemoOne<CustomEditor>(
    () =>
      withInsert(config)(
        withDelete(
          withNormalizations(structure)(
            withElAttrsConfig(
              withCustomConfig(config)(
                withReact(withHistory(mockEditor ?? createEditor())),
              ),
            ),
          ),
        ),
      ),
    [],
  )

  const decorate = useCallback(([node, path]) => {
    let ranges = []

    if (Text.isText(node)) {
      ranges = ranges.concat(
        flagChars(INVISIBLE_CHARS, 'invisible')([node, path]),
      )
      // TODO: this selects the whole node. Why? No idea.
      ranges = ranges.concat(flagChars(ERROR_CHARS, 'error')([node, path]))
    }

    return ranges
  }, [])

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const renderElement = useCallback(
    ({ children, ...props }) => (
      <ElementComponent {...props}>{children}</ElementComponent>
    ),
    [],
  )

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props}>{children}</LeafComponent>
    ),
    [],
  )

  return (
    <RenderContextProvider t={config.t} Link={config.Link} nav={config.nav}>
      <FormContextProvider>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            // console.log({ newValue })
            setValue(newValue)
          }}
        >
          <FormOverlay />
          {!config.readOnly && <Toolbar />}
          <LayoutContainer
            style={{ position: 'sticky', zIndex: 1 }}
            schema={config.schema}
          >
            <Editable
              readOnly={config.readOnly}
              data-testid='slate-content-editable'
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorate}
              onKeyDown={(event) => {
                // console.log('event', event.key, event.shiftKey, event)

                // disable key down events if max signs is reached
                if (
                  config.maxSigns &&
                  getCharCount(editor.children) >= config.maxSigns &&
                  !NAV_KEYS.concat('Backspace').includes(event.key)
                ) {
                  event.preventDefault()
                  return false
                }

                insertOnKey({ name: 'Enter', shift: true }, 'break')(
                  editor,
                  event,
                )
                handleInsert(editor, event)
                navigateOnTab(editor, event)
              }}
            />
          </LayoutContainer>
          <Footer config={config} />
        </Slate>
      </FormContextProvider>
    </RenderContextProvider>
  )
}

export default SlateEditor

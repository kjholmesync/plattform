import React, { useCallback, useEffect } from 'react'
import { createEditor, Editor, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useSelected,
} from 'slate-react'
import { useMemoOne } from 'use-memo-one'
import { withNormalizations } from './decorators/normalization'
import { withElAttrsConfig } from './decorators/attrs'
import Footer from './Footer'
import { FormContextProvider, FormOverlay, useFormContext } from './Forms'
import Toolbar from './Toolbar'
import { config as elementsConfig } from '../config/elements'
import { LeafComponent } from './Mark'
import {
  CustomDescendant,
  CustomEditor,
  CustomElement,
  EditorConfig,
  NodeTemplate,
} from '../custom-types'
import { NAV_KEYS, navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { withInsert } from './decorators/insert'
import { withDelete } from './decorators/delete'
import { withCustomConfig } from './decorators/config'
import { ErrorMessage } from '../Render/Message'
import { LayoutContainer } from '../Render/Containers'
import { getCharCount } from './helpers/text'
import BlockUi from './BlockUi'
import { RenderContextProvider } from '../Render/Context'

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

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const RenderedElement: React.FC<{
    element: CustomElement
    attributes: any
  }> = ({ element, children, attributes }) => {
    const setFormPath = useFormContext()[1]
    const isSelected = useSelected()
    const config = elementsConfig[element.type]
    if (!config) {
      return (
        <ErrorMessage
          attributes={attributes}
          error={`${element.type} config missing`}
        >
          {children}
        </ErrorMessage>
      )
    }
    const isVoid = config.attrs?.isVoid
    const showBlockUi =
      !config.attrs?.isInline && (config.Form || element.template?.repeat)
    const Component =
      editor.customConfig.editorSchema?.[element.type] ||
      editor.customConfig.schema[element.type]

    if (!Component) {
      return (
        <ErrorMessage
          attributes={attributes}
          error={`${element.type} component missing in schema`}
        >
          {children}
        </ErrorMessage>
      )
    }
    const path = ReactEditor.findPath(editor, element)
    const selectVoid = (e) => {
      if (isVoid) {
        e.preventDefault()
        Transforms.select(editor, path)
      }
    }
    const baseStyles = showBlockUi
      ? { position: 'relative', display: 'block' }
      : {}
    return (
      <Component
        {...element}
        attributes={{
          ...attributes,
          style: { ...attributes.style, ...baseStyles },
        }}
        onMouseDown={selectVoid}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setFormPath(path)
        }}
      >
        {showBlockUi && isSelected && <BlockUi path={path} element={element} />}
        {children}
      </Component>
    )
  }

  const renderElement = useCallback(RenderedElement, [])

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props}>{children}</LeafComponent>
    ),
    [],
  )

  return (
    <RenderContextProvider>
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

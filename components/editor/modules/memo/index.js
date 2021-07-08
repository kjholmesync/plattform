import React, { useState, useEffect } from 'react'
import { css, left } from 'glamor'
import MarkdownSerializer from 'slate-mdast-serializer'
import AutosizeInput from 'react-textarea-autosize'
import MemoIcon from 'react-icons/lib/fa/pencil-square'
import NoteIcon from 'react-icons/lib/fa/sticky-note'
import RemoveIcon from 'react-icons/lib/fa/trash'
import EditIcon from 'react-icons/lib/md/edit'

import {
  Field,
  Button,
  Overlay,
  OverlayToolbar,
  OverlayBody,
  useColorContext,
  fontStyles,
  A
} from '@project-r/styleguide'

import { matchInline, createInlineButton, buttonStyles } from '../../utils'

const fadeIn = css.keyframes('fadeIn', {
  '0%': { opacity: 0 },
  '100%': { opacity: 1 }
})

const styles = {
  contextMenu: css({
    position: 'absolute',
    padding: '5px 5px 5px 5px',
    marginTop: '-25px',
    cursor: 'pointer',
    opacity: 0,
    animation: `${fadeIn} 20ms ease-in 150ms`,
    animationFillMode: 'forwards',
    ...fontStyles.sansSerifRegular16
  }),
  contextMenuContainer: css({
    display: 'flex',
    alignItems: 'center'
  }),
  editButton: css({
    position: 'absolute',
    left: -40,
    marginTop: -30,
    ':hover': {
      cursor: 'pointer'
    }
  }),
  autoSize: css({
    paddingTop: '7px !important',
    paddingBottom: '6px !important'
  }),
  marker: css({
    borderRadius: '100%',
    border: '1px solid',
    width: '1em',
    height: '1em',
    verticalAlign: 'middle'
  })
}

const markerColors = {
  yellow: [255, 255, 0],
  pink: [255, 0, 255],
  green: [0, 255, 0],
  blue: [0, 255, 255]
}

const getMarkerColor = color => {
  return markerColors[color] || [255, 255, 0]
}

const serialize = string => {
  try {
    return JSON.stringify(string)
  } catch (e) {
    console.warn('Unable to serialize string', { string })
    return string
  }
}

const deserialize = json => {
  try {
    return JSON.parse(json || '""')
  } catch (e) {
    console.warn('Unable to deserialize json', { json })
    return json
  }
}

const Memo = props => {
  const [colorScheme] = useColorContext()
  const [showModal, setShowModal] = useState()
  const [memoRef, setMemoRef] = useState()
  const [memo, setMemo] = useState()
  const [color, setColor] = useState()
  const [dirty, setDirty] = useState()

  const { editor, node, children, isSelected } = props // isSelected

  // If Memo is untouched – flag is missing – open overlay.
  useEffect(() => {
    !node.data.get('touched') && open()
  }, [node.data.get('touched')])

  useEffect(() => {
    if (memoRef) {
      memoRef.focus()
      memoRef.setSelectionRange(memoRef.value.length, memoRef.value.length)
    }
  }, [memoRef])

  const change = (e, value) => {
    e?.preventDefault?.()

    setMemo(value)
    value !== memo && setDirty(true)
  }

  const colorize = color => e => {
    e?.preventDefault?.()

    setColor(color)
    editor.change(change => {
      change.setNodeByKey(node.key, {
        data: node.data.merge({
          color
        })
      })
    })
  }

  const submit = e => {
    e?.preventDefault?.()

    editor.change(change => {
      change.setNodeByKey(node.key, {
        data: node.data.merge({
          memo: serialize(memo),
          touched: true
        })
      })
    })

    close()
    !memo.length && remove()
  }

  const open = e => {
    e?.preventDefault?.()

    setMemo(deserialize(node.data.get('memo')))
    setDirty(false)
    setShowModal(true)
  }

  const close = e => {
    e?.preventDefault?.()

    setShowModal(false)
  }

  const remove = e => {
    e?.preventDefault?.()

    editor.change(change => {
      change.unwrapInline(node.type)
    })
  }

  return (
    <>
      {showModal && (
        <Overlay mUpStyle={{ maxWidth: 720, minHeight: 0 }} onClose={close}>
          <OverlayToolbar onClose={close} />

          <OverlayBody>
            <Field
              ref={setMemoRef}
              label={'Memo'}
              name='memo'
              value={memo}
              onChange={change}
              renderInput={({ ref, ...inputProps }) => (
                <AutosizeInput
                  {...inputProps}
                  {...styles.autoSize}
                  inputRef={ref}
                />
              )}
            />
            <Button onClick={submit} disabled={!dirty}>
              {memo.length ? 'Übernehmen' : 'Entfernen'}
            </Button>
          </OverlayBody>
        </Overlay>
      )}
      {isSelected && (
        <span
          {...styles.contextMenu}
          style={{
            backgroundColor: isSelected
              ? `rgb(${getMarkerColor(color).join(',')})`
              : `rgba(${getMarkerColor(color).join(',')},0.4)`
          }}
        >
          <div onClick={open}>
            <EditIcon />
            <div style={{ textOverflow: 'ellipsis' }}>{memo}</div>
          </div>
          <div {...styles.contextMenuContainer}>
            {Object.keys(markerColors).map((color, index) => (
              <div
                key={`marker-color-${index}`}
                {...styles.marker}
                style={{
                  backgroundColor: `rgb(${getMarkerColor(color).join(',')})`
                }}
                onClick={colorize(color)}
              />
            ))}
            {/* <A onClick={open}>öffnen</A> */}
            <A onClick={remove}>löschen</A>
            {/*<NoteIcon
              {...colorScheme.set('fill', 'text')}
              style={{ verticalAlign: 'middle' }}
              onClick={open}
            />
            <RemoveIcon 
              {...colorScheme.set('fill', 'text')}
              style={{ verticalAlign: 'middle' }}
            onClick={remove}
            /> */}
          </div>
        </span>
      )}
      <span
        // {...colorScheme.set('backgroundColor', 'alert')}
        style={{
          backgroundColor: isSelected
            ? `rgb(${getMarkerColor(color).join(',')},0.8)`
            : `rgba(${getMarkerColor(color).join(',')},0.4)`,
          paddingTop: '.2em',
          paddingBottom: '.2em'
        }}
        onDoubleClick={open}
      >
        {/* isSelected && (
          <div {...styles.editButton} role='button' onClick={open}>
            <MemoIcon {...colorScheme.set('fill', 'text')} />
          </div>
        ) */}
        {children}
      </span>
    </>
  )
}

const MemoModule = ({ rule, TYPE }) => {
  const memo = {
    match: matchInline(TYPE),
    matchMdast: rule.matchMdast,
    fromMdast: (node, index, parent, { visitChildren, context }) => {
      console.log('fromMdast', { node, data: node.data, memo: node.data?.memo })

      return {
        kind: 'inline',
        type: TYPE,
        data: {
          ...node.data,
          touched: true
        },
        nodes: visitChildren(node)
      }
    },
    toMdast: (object, index, parent, { visitChildren }) => {
      console.log('toMdast', { object })

      return {
        type: 'span',
        data: {
          type: TYPE,
          memo: object.data?.memo
        },
        children: visitChildren(object)
      }
    }
  }

  const serializer = new MarkdownSerializer({
    rules: [memo]
  })

  return {
    TYPE,
    helpers: {
      serializer
    },
    ui: {
      textFormatButtons: [
        createInlineButton({
          type: TYPE,
          parentTypes: rule.editorOptions?.parentTypes
        })(({ active, disabled, visible, ...props }) => (
          <span
            {...buttonStyles.mark}
            {...props}
            data-active={active}
            data-disabled={disabled}
            data-visible={visible}
          >
            <MemoIcon />
          </span>
        ))
      ]
    },
    plugins: [
      {
        renderNode(props) {
          const { children, ...rest } = props
          if (!memo.match(rest.node)) return

          return <Memo {...rest}>{children}</Memo>
        }
      }
    ]
  }
}

export default MemoModule

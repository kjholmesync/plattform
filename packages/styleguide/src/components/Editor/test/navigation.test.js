import { createEditor, Transforms } from 'slate'
import { selectAdjacent } from '../Core/helpers/tree'
import { toggleElement, insertRepeat } from '../Core/helpers/structure'
import schema from '../schema/article'
import mockEditor from './mockEditor'

describe('Slate Editor: Navigation (On Tab)', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(config) {
    return await mockEditor(createEditor(), {
      config,
      value,
      setValue: (val) => (value = val),
    })
  }

  it('should allow forward and backward navigation (incl. nested elements)', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum' }],
      },
      {
        type: 'figure',
        children: [
          {
            type: 'figureImage',
            children: [{ text: '' }],
          },
          {
            type: 'figureCaption',
            children: [
              { text: 'A butterfly' },
              { type: 'figureByline', children: [{ text: 'N. Hardy' }] },
              { text: '', end: true },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'CO' },
          { text: '2', sub: true },
          {
            type: 'break',
            children: [{ text: '' }],
          },
          { text: 'levels are ' },
          {
            type: 'link',
            href: 'https://www.republik.ch',
            children: [{ text: 'kinda funny' }],
          },
          { text: '' },
        ],
      },
      {
        type: 'ul',
        children: [
          {
            type: 'listItem',
            children: [{ text: 'One' }],
          },
          {
            type: 'listItem',
            children: [{ text: 'Two' }],
          },
        ],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'figure', 'ul'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await Transforms.select(editor, {
      path: [0, 0],
      offset: 3,
    })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    // forward tab nav
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 0 })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // we cannot go any further
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 1, 0], offset: 0 })

    // backward tab nav
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [3, 0, 0], offset: 3 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 5], offset: 0 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 4, 0], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 3], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 1], offset: 1 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 2 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 1, 0], offset: 8 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 1, 0], offset: 11 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [1, 0, 0], offset: 0 })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 11 })

    // we cannot go any further
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 11 })
  })

  it('should select next node after end of the selection if navigating forward and multiple blocks are selected', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Fourteen' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Seven' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Eleven' }],
      },
    ]
    const structure = [
      {
        type: 'headline',
      },
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await Transforms.select(editor, {
      anchor: { path: [1, 0], offset: 2 },
      focus: { path: [0, 0], offset: 4 },
    })

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [2, 0], offset: 0 })
  })

  it('should select next node after start of the selection if navigating backward and multiple blocks are selected', async () => {
    value = [
      {
        type: 'headline',
        children: [{ text: 'Fourteen' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Seven' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Eleven' }],
      },
    ]
    const structure = [
      {
        type: 'headline',
      },
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })
    await Transforms.select(editor, {
      anchor: { path: [2, 0], offset: 2 },
      focus: { path: [1, 0], offset: 4 },
    })

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus).toEqual({ path: [0, 0], offset: 8 })
  })

  it('should still work after inserts/converts/normalisation', async () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]
    const structure = [
      {
        type: ['paragraph', 'figure', 'ul'],
        repeat: true,
      },
    ]
    const editor = await setup({ ...defaultConfig, structure })

    // build tree
    await Transforms.select(editor, [0, 0])
    insertRepeat(editor)
    await new Promise(process.nextTick)

    toggleElement(editor, 'figure')
    await new Promise(process.nextTick)

    await Transforms.select(editor, [1, 1, 1, 0])
    insertRepeat(editor)
    await new Promise(process.nextTick)

    insertRepeat(editor)
    await new Promise(process.nextTick)

    await Transforms.select(editor, [3])
    toggleElement(editor, 'ul')
    await new Promise(process.nextTick)

    await Transforms.select(editor, [0])

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 0, 0])

    // forward tab nav
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 1, 0])

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 1, 1, 0])

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([2, 0])

    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([3, 0, 0])

    // we cannot go any further
    selectAdjacent(editor, 'next')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([3, 0, 0])

    // backward tab nav
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([2, 0])

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 1, 1, 0])

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 1, 0])

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([1, 0, 0])

    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([0, 0])

    // we cannot go any further
    selectAdjacent(editor, 'previous')
    await new Promise(process.nextTick)
    expect(editor.selection.focus.path).toEqual([0, 0])
  })
})

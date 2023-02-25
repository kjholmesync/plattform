import { ElementConfigI } from '../../custom-types'
import { ParagraphIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [
    { type: ['text', 'memo', 'link', 'break', 'inlineCode'], repeat: true },
  ],
  attrs: {
    formatText: true,
    blockUi: {
      style: {
        top: 4,
      },
    },
  },
  button: { icon: ParagraphIcon },
}

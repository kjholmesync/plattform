import { ElementConfigI } from '../../custom-types'
import { CodeIcon } from '../../../Icons'

export const config: ElementConfigI = {
  structure: [{ type: ['text', 'memo'], repeat: true }],
  attrs: {
    isInline: true,
  },
  button: { icon: CodeIcon },
}

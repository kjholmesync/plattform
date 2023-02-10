import { SLIDER_VALUES, SliderValue, SliderStepKey } from './config'

export type { SliderValue } from './config'

export const getSliderStepAtPosition = (pos: number): SliderValue => {
  return SLIDER_VALUES[pos] ?? SLIDER_VALUES[0]
}

export const getSliderStep = (key: SliderStepKey): SliderValue => {
  return SLIDER_VALUES.find((v) => v.step.key === key) ?? SLIDER_VALUES[0]
}

export const getFirstSliderStep = (): SliderValue => {
  return SLIDER_VALUES[0]
}

export const getLastSliderStep = (): SliderValue => {
  return SLIDER_VALUES[SLIDER_VALUES.length - 1]
}

export const getDefaultSliderStep = (): SliderValue => {
  return SLIDER_VALUES.find((v) => v.isDefault) ?? SLIDER_VALUES[0]
}

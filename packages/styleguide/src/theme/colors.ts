// some defaults are precomputed colors from d3-scale-chromatic
/*
 sequential = [
  d3.interpolateBlues(1),
  d3.interpolateBlues(0.95),
  d3.interpolateBlues(0.9),
  d3.interpolateBlues(0.85),
  d3.interpolateBlues(0.8),
  d3.interpolateBlues(0.75),
  d3.interpolateBlues(0.7),
  d3.interpolateBlues(0.65),
  d3.interpolateBlues(0.6),
  d3.interpolateBlues(0.55),
  d3.interpolateBlues(0.5)
 ],
 sequential3 = [d3.interpolateBlues(1), d3.interpolateBlues(0.8), d3.interpolateBlues(0.6)],
 opposite3 = [d3.interpolateReds(1), d3.interpolateReds(0.8), d3.interpolateReds(0.6)],
 discrete = d3.schemeCategory10
 */

// ToDos
// - mv getJson('COLORS') to a var
// - deep merge into light and dark
// - create open source color scheme, mv brand values to env via internal handbook

const colors = {
  light: {
    logo: '#000000',
    default: '#FFFFFF',
    overlay: '#FFFFFF',
    hover: '#F6F8F7',
    alert: '#E4F5E1',
    error: '#9F2500',
    defaultInverted: '#191919',
    overlayInverted: '#1F1F1F',
    divider: '#DADDDC',
    dividerInverted: '#4C4D4C',
    primary: '#00AA00',
    primaryHover: '#008800',
    primaryText: '#FFFFFF',
    text: '#282828',
    textInverted: '#F0F0F0',
    textSoft: '#757575',
    textSoftInverted: '#A9A9A9',
    disabled: '#949494',
    accentColorBriefing: '#0A99B8',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#000000',
    accentColorAudio: '#000000',
    accentColorFlyer: '#002BA3',
    overlayShadow: '0 0 15px rgba(0,0,0,0.1)',
    fadeOutGradientDefault:
      'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    fadeOutGradientDefault90:
      'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    fadeOutGradientOverlay:
      'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    displayLight: 'block',
    displayDark: 'none',
    sequential100: 'rgb(8, 48, 107)',
    sequential95: 'rgb(8, 61, 126)',
    sequential90: 'rgb(10, 74, 144)',
    sequential85: 'rgb(15, 87, 159)',
    sequential80: 'rgb(24, 100, 170)',
    sequential75: 'rgb(34, 113, 180)',
    sequential70: 'rgb(47, 126, 188)',
    sequential65: 'rgb(60, 139, 195)',
    sequential60: 'rgb(75, 151, 201)',
    sequential55: 'rgb(91, 163, 207)',
    sequential50: 'rgb(109, 174, 213)',
    opposite100: 'rgb(103,0,13)',
    opposite80: 'rgb(187,21,26)',
    opposite60: 'rgb(239,69,51)',
    neutral: '#bbb',
    discrete1: '#1f77b4',
    discrete2: '#ff7f0e',
    discrete3: '#2ca02c',
    discrete4: '#d62728',
    discrete5: '#9467bd',
    discrete6: '#8c564b',
    discrete7: '#e377c2',
    discrete8: '#7f7f7f',
    discrete9: '#bcbd22',
    discrete10: '#17becf',
    chartsInverted: '#000000',
    flyerBg: '#E6ECFF',
    flyerText: '#141414',
    flyerMetaText: '#002BA3',
    flyerFormatText: '#990025',
    imageChoiceShadow:
      '0 1px 2px 0 rgba(0, 0, 0, 0.24), 0 0 2px 0 rgba(0, 0, 0, 0.12)',
    imageChoiceShadowHover:
      '0 4px 8px 0 rgba(0, 0, 0, 0.24), 0 0 8px 0 rgba(0, 0, 0, 0.12)',
    boxShadowBottomNavBar: '0 -5px 10px -3px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    logo: '#FFFFFF',
    default: '#191919',
    overlay: '#1F1F1F',
    hover: '#292929',
    alert: '#144313',
    error: '#F0400A',
    defaultInverted: '#FFFFFF',
    overlayInverted: '#FFFFFF',
    divider: '#4C4D4C',
    dividerInverted: '#DADDDC',
    primary: '#00AA00',
    primaryHover: '#008800',
    primaryText: '#FFFFFF',
    text: '#F0F0F0',
    textInverted: '#282828',
    textSoft: '#A9A9A9',
    textSoftInverted: '#757575',
    disabled: '#6E6E6E',
    accentColorBriefing: '#0A99B8',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#FFFFFF',
    accentColorAudio: '#FFFFFF',
    accentColorFlyer: '#A3BBFF',
    overlayShadow: '0 0 15px rgba(0,0,0,0.3)',
    fadeOutGradientDefault:
      'linear-gradient(0deg, rgba(25,25,25,1) 0%, rgba(25,25,25,0) 100%)',
    fadeOutGradientDefault90:
      'linear-gradient(90deg, rgba(25,25,25,1) 0%, rgba(25,25,25,0) 100%)',
    fadeOutGradientOverlay:
      'linear-gradient(0deg, rgba(31,31,31,1) 0%, rgba(31,31,31,0) 100%)',
    displayLight: 'none',
    displayDark: 'block',
    sequential100: 'rgb(24, 100, 170)',
    sequential95: 'rgb(34, 113, 180)',
    sequential90: 'rgb(47, 126, 188)',
    sequential85: 'rgb(60, 139, 195)',
    sequential80: 'rgb(75, 151, 201)',
    sequential75: 'rgb(91, 163, 207)',
    sequential70: 'rgb(109, 174, 213)',
    sequential65: 'rgb(128, 185, 218)',
    sequential60: 'rgb(147, 195, 223)',
    sequential55: 'rgb(165, 204, 228)',
    sequential50: 'rgb(181, 212, 233)',
    opposite100: 'rgb(187,21,26)',
    opposite80: 'rgb(239,69,51)',
    opposite60: 'rgb(252, 138, 107)',
    neutral: '#bbb',
    discrete1: '#1f77b4',
    discrete2: '#ff7f0e',
    discrete3: '#2ca02c',
    discrete4: '#d62728',
    discrete5: '#9467bd',
    discrete6: '#8c564b',
    discrete7: '#e377c2',
    discrete8: '#7f7f7f',
    discrete9: '#bcbd22',
    discrete10: '#17becf',
    chartsInverted: '#FFFFFF',
    flyerBg: '#001140',
    flyerText: '#F0F0F0',
    flyerMetaText: '#A3BBFF',
    flyerFormatText: '#D90034',
    imageChoiceShadow:
      '0 1px 2px 0 rgba(255, 255, 255, 0.24), 0 0 2px 0 rgba(255, 255, 255, 0.12)',
    imageChoiceShadowHover:
      '0 4px 8px 0 rgba(255, 255, 255, 0.24), 0 0 8px 0 rgba(255, 255, 255, 0.12)',
    boxShadowBottomNavBar: '0 -5px 10px -3px rgba(0, 0, 0, 0.1)',
  },
  mappings: {
    format: {
      '#000': 'accentColorMeta',
      '#000000': 'accentColorMeta',
      '#282828': 'accentColorMeta',
      '#07809A': 'accentColorBriefing',
      '#07809a': 'accentColorBriefing',
      '#405080': 'accentColorFlyer',
    },
    charts: {
      '#000': 'chartsInverted',
      '#000000': 'chartsInverted',
    },
  },
}

// // add all deprecated colors, but only if they don't exist in new colors (no overwrites)
// Object.keys(colorsDeprecated).forEach((key) => {
//   if (!colors[key]) {
//     colors[key] = colorsDeprecated[key]
//   }
// })

export default colors

export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const API_WS_URL = process.env.NEXT_PUBLIC_API_WS_URL
export const API_ASSETS_BASE_URL = process.env.NEXT_PUBLIC_API_ASSETS_BASE_URL
export const ASSETS_SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_ASSETS_SERVER_BASE_URL
export const API_AUTHORIZATION_HEADER =
  process.env.NEXT_PUBLIC_API_AUTHORIZATION_HEADER

export const APP_OPTIONS =
  !!process.env.NEXT_PUBLIC_APP_OPTIONS &&
  process.env.NEXT_PUBLIC_APP_OPTIONS !== 'false' &&
  process.env.NEXT_PUBLIC_APP_OPTIONS !== '0'

/**
 * VERCEL*_URL has no protocol, so we need to append it ourselves
 * @param {string | null | undefined} url
 * @returns {string | null | undefined}
 */
function appendProtocol(href) {
  if (href && !href.startsWith('http')) {
    return `${isDev ? 'http' : 'https'}://${href}`
  }
  return href
}

export const PUBLIC_BASE_URL = appendProtocol(
  process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL,
)
export const CDN_FRONTEND_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_FRONTEND_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  PUBLIC_BASE_URL
export const RENDER_FRONTEND_BASE_URL =
  process.env.NEXT_PUBLIC_RENDER_FRONTEND_BASE_URL || PUBLIC_BASE_URL

export const PUBLIKATOR_BASE_URL = process.env.NEXT_PUBLIC_PUBLIKATOR_BASE_URL
export const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BASE_URL

export const MATOMO_URL_BASE = process.env.NEXT_PUBLIC_MATOMO_URL_BASE
export const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

export const SG_COLORS = process.env.NEXT_PUBLIC_SG_COLORS
export const SG_FONT_STYLES = process.env.NEXT_PUBLIC_SG_FONT_STYLES
export const SG_FONT_FACES = process.env.NEXT_PUBLIC_SG_FONT_FACES
export const SG_LOGO_PATH = process.env.NEXT_PUBLIC_SG_LOGO_PATH
export const SG_LOGO_VIEWBOX = process.env.NEXT_PUBLIC_SG_LOGO_VIEWBOX
export const SG_LOGO_GRADIENT = process.env.NEXT_PUBLIC_SG_LOGO_GRADIENT
export const SG_BRAND_MARK_PATH = process.env.NEXT_PUBLIC_SG_BRAND_MARK_PATH
export const SG_BRAND_MARK_VIEWBOX =
  process.env.NEXT_PUBLIC_SG_BRAND_MARK_VIEWBOX
export const SG_DYNAMIC_COMPONENT_BASE_URLS =
  process.env.NEXT_PUBLIC_SG_DYNAMIC_COMPONENT_BASE_URLS

export const CROWDFUNDING = process.env.NEXT_PUBLIC_CROWDFUNDING
export const CROWDFUNDING_PLEDGE =
  process.env.NEXT_PUBLIC_CROWDFUNDING_PLEDGE || CROWDFUNDING
export const CROWDFUNDING_META =
  process.env.NEXT_PUBLIC_CROWDFUNDING_META || CROWDFUNDING

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
export const PF_PSPID = process.env.NEXT_PUBLIC_PF_PSPID
export const PF_FORM_ACTION = process.env.NEXT_PUBLIC_PF_FORM_ACTION
export const PAYPAL_FORM_ACTION = process.env.NEXT_PUBLIC_PAYPAL_FORM_ACTION
export const PAYPAL_BUSINESS = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS
export const PAYPAL_DONATE_LINK = process.env.NEXT_PUBLIC_PAYPAL_DONATE_LINK

export const EMAIL_CONTACT = process.env.NEXT_PUBLIC_EMAIL_CONTACT
export const EMAIL_IR = process.env.NEXT_PUBLIC_EMAIL_IR
export const EMAIL_PAYMENT =
  process.env.NEXT_PUBLIC_EMAIL_PAYMENT || process.env.NEXT_PUBLIC_EMAIL_CONTACT

export const CURTAIN_MESSAGE = process.env.NEXT_PUBLIC_CURTAIN_MESSAGE
export const CURTAIN_META = process.env.NEXT_PUBLIC_CURTAIN_META
export const CURTAIN_COLORS = process.env.NEXT_PUBLIC_CURTAIN_COLORS

export const DISCUSSION_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_DISCUSSION_POLL_INTERVAL_MS || 0
export const STATS_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_STATS_POLL_INTERVAL_MS || 0
export const STATUS_POLL_INTERVAL_MS =
  +process.env.NEXT_PUBLIC_STATUS_POLL_INTERVAL_MS || 0

export const GENERAL_FEEDBACK_DISCUSSION_ID =
  process.env.NEXT_PUBLIC_GENERAL_FEEDBACK_DISCUSSION_ID
export const PROGRESS_EXPLAINER_PATH =
  process.env.NEXT_PUBLIC_PROGRESS_EXPLAINER_PATH

export const ONBOARDING_PACKAGES = [
  'ABO',
  'BENEFACTOR',
  'MONTHLY_ABO',
  'YEARLY_ABO',
]

export const TRIAL_CAMPAIGN = process.env.NEXT_PUBLIC_TRIAL_CAMPAIGN
export const TRIAL_CAMPAIGNS = process.env.NEXT_PUBLIC_TRIAL_CAMPAIGNS

export const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

export const isDev = process.env.NODE_ENV !== 'production'
export const isClient = typeof window !== 'undefined'

export const PROLITTERIS_OPT_OUT_CONSENT = 'PROLITTERIS_OPT_OUT'

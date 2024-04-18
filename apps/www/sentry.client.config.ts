// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: 'https://ba8ba4ea6d7f9ad150547a6a15ac51f2@o4507101684105216.ingest.de.sentry.io/4507101768908880',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: isProduction ? 0.1 : 1,
  debug: false,
  integrations: [],
})

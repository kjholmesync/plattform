const { newAuthError } = require('./AuthError')
const MissingConsentsError = newAuthError(
  'missing-consents',
  'api/consents/missing',
)

const revokeHooks = []

// except newsletters, because they are called from inside the backend and not through the mutation
const VALID_POLICIES = [
  'PRIVACY',
  'TOS',
  'STATUTE',
  'PROGRESS',
  'PROLITTERIS_OPT_OUT',
]

// except newsletters, because they are called from inside the backend and not through the mutation
const REVOKABLE_POLICIES = ['PROGRESS', 'PROLITTERIS_OPT_OUT']

const ENFORCE_CONSENTS = ['PRIVACY']

const getAllConsentRecords = ({ userId, pgdb }) =>
  pgdb.public.consents.find(
    {
      userId,
    },
    {
      orderBy: ['createdAt asc'],
    },
  )

// only returns GRANTed consents
const consentsOfUser = async ({ userId, pgdb }) => {
  const consents = await getAllConsentRecords({ userId, pgdb })

  const grantedPolicies = {}
  for (const consent of consents) {
    if (consent.record === 'GRANT') {
      grantedPolicies[consent.policy] = true
    } else {
      delete grantedPolicies[consent.policy]
    }
  }

  return Object.keys(grantedPolicies)
}

// returns the latest record of all policies
const lastRecordForPolicyForUser = async ({ userId, policy, pgdb }) =>
  pgdb.public.consents.findFirst(
    {
      userId,
      policy,
    },
    {
      orderBy: ['createdAt desc'],
    },
  )

const statusForPolicyForUser = async (args) =>
  lastRecordForPolicyForUser(args).then(
    (record) => record && record.record === 'GRANT',
  )

const requiredConsents = async ({ userId, pgdb }) => {
  if (ENFORCE_CONSENTS) {
    const consented = userId ? await consentsOfUser({ userId, pgdb }) : []

    return ENFORCE_CONSENTS.filter(
      (consent) => consented.indexOf(consent) === -1,
    )
  }
  return []
}

const missingConsents = async ({ userId, consents = [], pgdb }) => {
  return requiredConsents({
    pgdb,
    userId,
  }).then((result) =>
    result.filter((consent) => consents.indexOf(consent) === -1),
  )
}

const ensureAllRequiredConsents = async (args) => {
  const _missingConsents = await missingConsents(args)
  if (_missingConsents.length > 0) {
    throw new MissingConsentsError(_missingConsents, {
      consents: _missingConsents.join(', '),
    })
  }
}

const saveConsents = async ({ userId, consents = [], req, pgdb }) => {
  // deduplicate
  const existingConsents = await consentsOfUser({ userId, pgdb })
  const insertConsents = consents.filter(
    (consent) => existingConsents.indexOf(consent) === -1,
  )
  return Promise.all(
    insertConsents.map((consent) =>
      pgdb.public.consents.insert({
        userId,
        policy: consent,
        ip: req.ip,
      }),
    ),
  )
}

const revokeConsent = async ({ userId, consent }, context) => {
  const { req, pgdb } = context
  await pgdb.public.consents.insert({
    userId,
    policy: consent,
    ip: req.ip,
    record: 'REVOKE',
  })
  for (const hook of revokeHooks) {
    await hook({ userId, consent }, context)
  }
}

const registerRevokeHook = (hook) => revokeHooks.push(hook)

module.exports = {
  REVOKABLE_POLICIES,
  VALID_POLICIES,
  lastRecordForPolicyForUser,
  statusForPolicyForUser,
  requiredConsents,
  missingConsents,
  ensureAllRequiredConsents,
  saveConsents,
  revokeConsent,
  registerRevokeHook,
}

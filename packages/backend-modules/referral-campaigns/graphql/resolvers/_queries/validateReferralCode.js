/** @typedef {import('@orbiting/backend-modules-types').GraphqlContext} GraphqlContext */

const { resolveUserByReferralCode } = require('../../../lib/referralCode')

/**
 * Find resolve campaign by slug
 * @param {object} _
 * @param {{ code: string }} args
 * @param {GraphqlContext} ctx
 * @returns {Promise<Object?>}
 */
module.exports = async (_, { code }, ctx) => {
  const user = await resolveUserByReferralCode(code, ctx.pgdb)
  if (user) {
    return true
  }

  return false
}

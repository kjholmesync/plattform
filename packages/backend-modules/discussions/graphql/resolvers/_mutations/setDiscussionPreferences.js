const { Roles } = require('@orbiting/backend-modules-auth')
const {
  setDiscussionPreferences,
} = require('../../../lib/discussionPreferences')

module.exports = async (_, args, { pgdb, user, t, loaders }) => {
  const { id, discussionPreferences } = args

  const transaction = await pgdb.transactionBegin()
  try {
    const discussion = await transaction.public.discussions.findOne({
      id,
    })
    if (!discussion) {
      throw new Error(t('api/discussion/404'))
    }

    Roles.ensureUserIsInRoles(user, discussion.allowedRoles)

    await setDiscussionPreferences({
      discussionPreferences,
      userId: user.id,
      discussion,
      transaction,
      t,
      loaders,
    })

    await transaction.transactionCommit()

    return discussion
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

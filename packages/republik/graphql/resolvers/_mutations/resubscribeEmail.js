const { Roles } = require('@orbiting/backend-modules-auth')
const MailchimpInterface = require('../../../../mail/MailchimpInterface')
const logger = console

module.exports = async (_, args, context) => {
  const { userId } = args
  const {
    user: me,
    pgdb,
    req,
    t,
    mail: { getNewsletterSettings },
  } = context

  const user = userId ? await pgdb.public.users.findOne({ id: userId }) : me

  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  const { email, firstName, lastName } = user

  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter'])

  const mailchimp = MailchimpInterface({ logger })
  const member = await mailchimp.getMember(email)

  const body = {
    email_address: email,
    status: MailchimpInterface.MemberStatus.Subscribed,
  }

  if (!member) {
    body.status_if_new = MailchimpInterface.MemberStatus.Subscribed
    body.merge_fields = {
      FNAME: firstName || '',
      LNAME: lastName || '',
    }
  }

  if (!member || member.status !== MailchimpInterface.MemberStatus.Subscribed) {
    await mailchimp.updateMember(email, body)
  }

  try {
    return getNewsletterSettings({ user })
  } catch (error) {
    console.error('getNewsletterProfile failed', { error })
    throw new Error(t('api/newsletters/get/failed'))
  }
}

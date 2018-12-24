const debug = require('debug')('crowdfundings:lib:Mail')

const { createMail, sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { grants } = require('@orbiting/backend-modules-access')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const { timeFormat, formatPriceChf } =
  require('@orbiting/backend-modules-formats')

const {
  checkMembershipSubscriptions: getCheckMembershipSubscriptions
} = require('../graphql/resolvers/User')
const { getLastEndDate } = require('./utils')

const dateFormat = timeFormat('%x')

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  FRONTEND_BASE_URL
} = process.env

const mail = createMail([
  {
    name: 'DAILY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    roles: ['member']
  },
  {
    name: 'FEUILLETON',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
    roles: ['member']
  },
  {
    name: 'WEEKLY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    roles: ['member']
  },
  {
    name: 'PROJECTR',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    roles: []
  }
])

const getInterestsForUser = async ({
  userId,
  subscribeToEditorialNewsletters,
  pgdb
}) => {
  const pledges = !!userId && await pgdb.public.pledges.find({
    userId,
    status: 'SUCCESSFUL'
  })
  const hasPledge = (!!pledges && pledges.length > 0)

  const hasMembership = !!userId && !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true
  }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })
  const isBenefactor = !!userId && membershipTypeBenefactor ? !!(await pgdb.public.memberships.findFirst({
    userId,
    membershipTypeId: membershipTypeBenefactor.id
  })) : false

  const user = !!userId && await pgdb.public.users.findOne({ id: userId })
  const accessGrants = !!user && await grants.findByRecipient(user, { pgdb })
  const hasGrantedAccess = !!user && !!accessGrants && accessGrants.length > 0

  debug({
    hasPledge,
    hasMembership,
    isBenefactor,
    hasGrantedAccess
  })

  // Update the membership type interests on mailchimp
  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: isBenefactor,
    [MAILCHIMP_INTEREST_GRANTED_ACCESS]: hasGrantedAccess
  }

  if (
    subscribeToEditorialNewsletters &&
    (hasMembership || hasGrantedAccess)
  ) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  return interests
}

mail.getInterestsForUser = getInterestsForUser

mail.enforceSubscriptions = async ({
  userId,
  email,
  subscribeToEditorialNewsletters,
  pgdb,
  ...rest
}) => {
  const user = !!userId && await pgdb.public.users.findOne({id: userId})

  const interests = await getInterestsForUser({
    userId: !!user && user.id,
    subscribeToEditorialNewsletters,
    pgdb
  })

  const sanitizedUser = user || { email, roles: [] }
  return mail.updateNewsletterSubscriptions({ user: sanitizedUser, interests, ...rest })
}

mail.sendMembershipProlongConfirmation = async ({
  pledger,
  membership,
  additionalPeriods,
  t,
  pgdb
}) => {
  const safePledger = transformUser(pledger)
  const safeMembershipUser = transformUser(membership.user)

  await sendMailTemplate({
    to: membership.user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      `api/email/membership_prolong_notice/subject`
    ),
    templateName: `membership_prolong_notice`,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: safeMembershipUser.name },
      { name: 'pledger_name',
        content: safePledger.name },
      { name: 'end_date',
        content: dateFormat(getLastEndDate(additionalPeriods)) }
    ]
  }, { pgdb })
}

mail.sendPledgeConfirmations = async ({ userId, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: userId })
  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    sendConfirmMail: true
  })

  if (!pledges.length) { return }

  const checkMembershipSubscriptions = await getCheckMembershipSubscriptions(user, null, { pgdb, user })

  const address = await pgdb.public.addresses.findOne({id: user.addressId})

  // get packageOptions which include the NOTEBOOK
  const goodieNotebook = await pgdb.public.goodies.findOne({name: 'NOTEBOOK'})
  const rewardNotebook = await pgdb.public.rewards.findOne({id: goodieNotebook.rewardId})
  const pkgOptionsNotebook = await pgdb.public.packageOptions.find({rewardId: rewardNotebook.id})
  const goodieTotebag = await pgdb.public.goodies.findOne({name: 'TOTEBAG'})
  const rewardTotebag = await pgdb.public.rewards.findOne({id: goodieTotebag.rewardId})
  const pkgOptionsTotebag = await pgdb.public.packageOptions.find({rewardId: rewardTotebag.id})

  await Promise.all(pledges.map(async (pledge) => {
    const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})
    const pledgePayment = await pgdb.public.pledgePayments.findFirst({pledgeId: pledge.id}, {orderBy: ['createdAt desc']})
    const payment = pledgePayment
      ? await pgdb.public.payments.findOne({id: pledgePayment.paymentId})
      : {}

    const notebook = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsNotebook.map(p => p.id),
      'amount >': 0
    })
    const totebag = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsTotebag.map(p => p.id),
      'amount >': 0
    })

    const pledgeOptions = await pgdb.public.pledgeOptions.find({
      pledgeId: pledge.id,
      'amount >': 0
    }, {
      orderBy: ['amount desc']
    })

    const packageOptions = await pgdb.public.packageOptions.find({
      id: pledgeOptions.map(o => o.templateId)
    })

    const rewardGoodies = await pgdb.public.goodies.find({
      rewardId: packageOptions.map(o => o.rewardId)
    })

    const rewardMembershipTypes = await pgdb.public.membershipTypes.find({
      rewardId: packageOptions.map(o => o.rewardId)
    })

    const rewards = rewardGoodies.concat(rewardMembershipTypes)

    packageOptions.forEach((packageOption, index, packageOptions) => {
      packageOptions[index].reward = rewards
        .find(r => r.rewardId === packageOption.rewardId)
    })

    // Find membership IDs mentoned in pledgeOption.membershipId
    const pledgedMemberships = pledgeOptions
      .map(pledgeOption => pledgeOption.membershipId)
      .filter(Boolean)

    // All affected memberships. These are memberships that spring from this
    // pledge, or memberships that were mentioned pledgeOption.membershipId.
    const memberships = await pgdb.public.memberships.find({
      or: [
        { pledgeId: pledge.id },
        pledgedMemberships.length > 0 && { id: pledgedMemberships }
      ].filter(Boolean)
    })

    const membershipsUsers =
      memberships.length > 0
        ? await pgdb.public.users.find(
          { id: memberships.map(m => m.userId) }
        )
        : []

    memberships.forEach((membership, index, memberships) => {
      memberships[index].user =
        membershipsUsers.find(u => u.id === membership.userId)
    })

    pledgeOptions.forEach((pledgeOption, index, pledgeOptions) => {
      pledgeOptions[index].packageOption = packageOptions
        .find(o => o.id === pledgeOption.templateId)

      if (pledgeOption.membershipId) {
        pledgeOptions[index].membership = memberships
          .find(m => m.id === pledgeOption.membershipId)
      }
    })

    pledgeOptions
      // Sort by packageOption.order in an ascending manner
      .sort(
        (a, b) =>
          a.packageOption &&
          b.packageOption &&
          a.packageOption.order > b.packageOption.order ? 1 : 0
      )
      // Sort by sequenceNumber in an ascending manner
      .sort(
        (a, b) =>
          a.membership &&
          b.membership &&
          a.membership.sequenceNumber < b.membership.sequenceNumber ? 1 : 0
      )
      // Sort by userID, own ones up top.
      .sort(
        (a, b) => a.membership && a.membership.userId !== pledge.userId ? 1 : 0
      )

    /*
      pledgeOptions[] {
        packageOption {
          reward {
            rewardType (Goodie|MembershipType)
            name
          }
        }
        membership {
          user
        }
      }
    */

    const giftedMemberships = memberships
      .filter(membership => pledge.userId !== membership.userId)

    const templateName = `pledge_${pkg.name.toLowerCase()}`

    const discount = pledge.donation < 0 ? (0 - pledge.donation) / 100 : 0
    const donation = pledge.donation > 0 ? pledge.donation / 100 : 0
    const total = pledge.total / 100

    return sendMailTemplate({
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        // Purchase itself
        { name: 'options',
          content: pledgeOptions
            // Filter "pseudo" pledge options without a reward
            .filter(pledgeOption => pledgeOption.packageOption.reward)
            .map(pledgeOption => {
              const { rewardType, name } = pledgeOption.packageOption.reward

              const isGiftedMembership =
                pledgeOption.membership &&
                pledgeOption.membership.userId !== pledge.userId

              const labelFragmentInterval = t.pluralize(
                `api/email/option/interval/${pledgeOption.packageOption.reward.interval}/periods`,
                { count: pledgeOption.periods })

              const labelDefault = t.pluralize(
                `api/email/option/${rewardType.toLowerCase()}/${name.toLowerCase()}`,
                { count: pledgeOption.amount, interval: labelFragmentInterval }
              )

              const labelGiftedMembership = t(
                'api/email/option/other/gifted_membership',
                {
                  name: pledgeOption.membership &&
                    transformUser(pledgeOption.membership.user).name,
                  sequenceNumber: pledgeOption.membership &&
                    pledgeOption.membership.sequenceNumber
                }
              )

              const oprice =
                (pledgeOption.price * (pledgeOption.periods || 1)) / 100
              const ototal =
                oprice * pledgeOption.amount

              return {
                oamount: pledgeOption.amount,
                otype: rewardType,
                oname: name,
                olabel: !isGiftedMembership
                  ? labelDefault
                  : labelGiftedMembership,
                oprice,
                oprice_formatted: formatPriceChf(oprice),
                ototal,
                ototal_formatted: formatPriceChf(ototal)
              }
            })
        },
        { name: 'discount',
          content: discount
        },
        { name: 'discount_formatted',
          content: formatPriceChf(discount)
        },
        { name: 'donation',
          content: donation
        },
        { name: 'donation_formatted',
          content: formatPriceChf(donation)
        },
        { name: 'total',
          content: total
        },
        { name: 'total_formatted',
          content: formatPriceChf(total)
        },

        // Payment
        { name: 'payment_method',
          content: payment.method },
        ...payment
          ? [
            { name: 'HRID',
              content: payment.hrid
            },
            { name: 'due_date',
              content: dateFormat(payment.dueDate)
            },
            { name: 'paymentslip',
              content: payment.method === 'PAYMENTSLIP'
            },
            { name: 'not_paymentslip',
              content: payment.method !== 'PAYMENTSLIP'
            }
          ]
          : [],
        { name: 'waiting_for_payment',
          content: pledge.status === 'WAITING_FOR_PAYMENT'
        },

        // Helpers
        { name: 'name',
          content: [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ')
            .trim()
        },
        { name: 'abo_for_me',
          content: ['ABO', 'BENEFACTOR'].includes(pkg.name)
        },
        { name: 'voucher_codes',
          content: ['ABO_GIVE', 'ABO_GIVE_MONTHS'].includes(pkg.name)
            ? memberships.map(m => m.voucherCode).join(', ')
            : null
        },
        { name: 'notebook_or_totebag',
          content: !!notebook || !!totebag
        },
        { name: 'goodies_count',
          content: pledgeOptions
            // Filter "pseudo" pledge options without a reward
            .filter(
              pledgeOption =>
                pledgeOption.packageOption.reward &&
                pledgeOption.packageOption.reward.rewardType === 'Goodie'
            )
            .reduce((agg, pledgeOption) => agg + pledgeOption.amount, 0)
        },
        { name: 'address',
          content: address
            ? `<span>${address.name}<br/>
${address.line1}<br/>
${address.line2 ? address.line2 + '<br/>' : ''}
${address.postalCode} ${address.city}<br/>
${address.country}</span>`
            : null
        },
        { name: 'check_membership_subscriptions',
          content: checkMembershipSubscriptions
        },
        { name: 'gifted_memberships_count',
          content: giftedMemberships.length
        },

        // Links
        { name: 'link_signin',
          content: `${FRONTEND_BASE_URL}/anmelden`
        },
        { name: 'link_dialog',
          content: `${FRONTEND_BASE_URL}/dialog`
        },
        { name: 'link_profile',
          content: `${FRONTEND_BASE_URL}/~me`
        },
        { name: 'link_account',
          content: `${FRONTEND_BASE_URL}/konto`
        },
        { name: 'link_account_account',
          content: `${FRONTEND_BASE_URL}/konto#account`
        },
        { name: 'link_claim',
          content: `${FRONTEND_BASE_URL}/abholen`
        }
      ]
    }, { pgdb })
  }))

  await pgdb.public.pledges.update({id: pledges.map(pledge => pledge.id)}, {
    sendConfirmMail: false
  })
}

mail.sendMembershipCancellation = async ({ email, name, endDate, membershipType, t, pgdb }) => {
  return sendMailTemplate({
    to: email,
    subject: t('api/email/membership_cancel_notice/subject'),
    templateName: 'membership_cancel_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: name
      },
      { name: 'end_date',
        content: dateFormat(endDate)
      },
      { name: 'membership_type',
        content: membershipType.name
      }
    ]
  }, { pgdb })
}

mail.prepareMembershipGiversProlongNotice = async ({ userId, membershipIds, informClaimersDays }, { t, pgdb }) => {
  const user = transformUser(
    await pgdb.public.users.findOne({ id: userId })
  )
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const memberships = await pgdb.public.memberships.find({
    id: membershipIds
  })

  const membershipsUsers =
    memberships.length > 0
      ? await pgdb.public.users.find(
        { id: memberships.map(m => m.userId) }
      )
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].user =
      membershipsUsers.find(u => u.id === membership.userId)
  })

  return ({
    to: user.email,
    subject: t('api/email/membership_giver_prolong_notice/subject'),
    templateName: 'membership_giver_prolong_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: user.name
      },
      { name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&membershipIds=${membershipIds.join('~')}&token=${customPledgeToken}`
      },
      { name: 'gifted_memberships_count',
        content: memberships.length
      },
      { name: 'inform_claimers_days',
        content: informClaimersDays
      },
      { name: 'options',
        content: memberships
          .map(membership => {
            const olabel =
              t('api/email/option/other/gifted_membership', {
                name: transformUser(membership.user).name,
                sequenceNumber: membership.sequenceNumber
              })
            return { olabel }
          })
      }
    ]
  })
}

mail.prepareMembershipWinback = async ({ userId, membershipId, cancellationCategory, cancelledAt }, { t, pgdb }) => {
  const user = transformUser(
    await pgdb.public.users.findOne({ id: userId })
  )
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  return ({
    to: user.email,
    fromEmail: t('api/email/membership_winback/fromEmail'),
    fromName: t('api/email/membership_winback/fromName'),
    subject: t('api/email/membership_winback/subject'),
    templateName: `membership_winback_${cancellationCategory}`,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: user.name
      },
      { name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      { name: 'prolong_url_reduced',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}&userPrice=1`
      },
      { name: 'cancelled_at',
        content: dateFormat(cancelledAt)
      }
    ]
  })
}

mail.prepareMembershipOwnerNotice = async ({ user, endDate, cancelUntilDate, templateName }, { t, pgdb }) => {
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const formattedEndDate = dateFormat(endDate)

  return ({
    to: user.email,
    subject: t(`api/email/${templateName}/subject`, { endDate: formattedEndDate }),
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: user.name
      },
      { name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      { name: 'end_date',
        content: formattedEndDate
      },
      { name: 'cancel_until_date',
        content: dateFormat(cancelUntilDate)
      }
    ]
  })
}

module.exports = mail

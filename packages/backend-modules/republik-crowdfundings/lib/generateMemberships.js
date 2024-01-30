const moment = require('moment')
const { getPledgeOptionsTree } = require('./Pledge')
const { evaluate, resolvePackages } = require('./CustomPackages')
const createCache = require('./cache')
const cancelMembership = require('./cancelMembership')
const debug = require('debug')('crowdfundings:memberships')
const mail = require('./Mail')
const Promise = require('bluebird')
const omit = require('lodash/omit')

module.exports = async (pledgeId, pgdb, t, redis) => {
  const pledge = await pgdb.public.pledges.findOne({ id: pledgeId })
  if (!pledge) {
    console.error('pledge could not be found', { pledgeId })
    throw new Error(t('api/unexpected'))
  }

  const user = await pgdb.public.users.findOne({ id: pledge.userId })
  if (!user) {
    console.error('user could not be found', {
      userId: pledge.userId,
      pledgeId,
    })
    throw new Error(t('api/unexpected'))
  }

  // check if pledge really has no memberships yet
  if (await pgdb.public.memberships.count({ pledgeId: pledge.id })) {
    console.error(
      'tried to generate memberships for a pledge which already has memberships',
      { pledge },
    )
    throw new Error(t('api/unexpected'))
  }

  const existingMemberships = await pgdb.public.memberships.count({
    userId: user.id,
  })

  // get ingredients
  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })

  const subscribeToOnboardingMails =
    existingMemberships === 0 &&
    ['ABO', 'MONTHLY_ABO', 'BENEFACTOR', 'YEARLY_ABO'].includes(pkg.name) // should not subscribe buyers of gift memberships to onbaording mails

  let hasRewards = false

  const pledgeOptions = await getPledgeOptionsTree(
    await pgdb.public.pledgeOptions.find({ pledgeId: pledge.id }),
    pgdb,
  )
  for (const plo of pledgeOptions) {
    if (plo.packageOption.reward) {
      hasRewards = true
    }
  }
  if (!hasRewards) {
    // it's a donation-only pledge
    return
  }

  // if the pledge has a negative donation:
  // 1) it's a one membership pledge
  // 2) this membership was bought for a reduced price
  // 3) this membership is not voucherable
  // voucherCodes get generated inside the db, but not for reducedPrice
  const reducedPrice = pledge.donation < 0

  const activeMemberships = await pgdb.public.query(
    `
    SELECT
      "memberships".*,
      "membershipTypes"."name"

    FROM "memberships"

    INNER JOIN "membershipTypes"
      ON "memberships"."membershipTypeId" = "membershipTypes"."id"

    WHERE
      "memberships"."userId" = :userId
      AND "memberships"."active" = true
  `,
    { userId: user.id },
  )

  const userHasActiveMembership = activeMemberships.length > 0

  const memberships = []
  const now = moment()

  let cancelableMemberships = []
  let membershipPeriod
  let subscribeToEditorialNewsletters = false

  await Promise.map(pledgeOptions, async (plo) => {
    if (plo.packageOption.reward.type !== 'MembershipType') {
      debug('pledgeOption reward type not "MembershipType"')
      return
    }

    // Is amount in pledgeOption > 0?
    if (plo.amount === 0) {
      debug('pledgeOption amount is 0')
      return
    }

    const { membershipType } = plo.packageOption.reward

    if (plo.membershipId) {
      debug('membershipId "%s"', plo.membershipId)

      const resolvedPackage = (
        await resolvePackages({
          packages: [pkg],
          pledger: user,
          pgdb,
        })
      ).shift()

      const membership = resolvedPackage.user.memberships.find(
        (m) => m.id === plo.membershipId,
      )

      // Refrain from generate periods if membership already has periods which
      // stem from passed pledge.
      if (membership.periods.find((p) => p.pledgeId === pledge.id)) {
        debug('periods already generated', {
          membershipId: membership.id,
          pledgeId: pledge.id,
        })
        return
      }

      const { additionalPeriods } = await evaluate({
        package_: resolvedPackage,
        packageOption: { ...plo.packageOption, membershipType },
        membership,
        lenient: true,
      })

      if (!additionalPeriods || additionalPeriods.length === 0) {
        console.error('evaluation returned no additional periods', { pledge })
        throw new Error(t('api/unexpected'))
      }

      await pgdb.public.membershipPeriods.insert(
        additionalPeriods
          .map((period) => omit(period, ['id', 'createdAt', 'updatedAt']))
          .map((period) => Object.assign(period, { pledgeId: plo.pledgeId })),
      )

      await pgdb.public.memberships.update(
        { id: plo.membershipId },
        {
          autoPay: plo.autoPay || membership.autoPay,
          active: true,
          renew: true,
          updatedAt: now,
        },
      )

      debug('additionalPeriods %o', additionalPeriods)

      if (membership.userId !== pledge.userId) {
        await mail.sendMembershipProlongConfirmation({
          pledger: user,
          membership,
          additionalPeriods,
          t,
          pgdb,
        })
      }
    } else {
      for (let c = 0; c < plo.amount; c++) {
        const membership = {
          userId: user.id,
          pledgeId: pledge.id,
          membershipTypeId: membershipType.id,
          reducedPrice,
          voucherable: !reducedPrice && !plo.packageOption.accessGranted,
          active: false,
          renew: false,
          autoPay: plo.autoPay || false,
          accessGranted: plo.packageOption.accessGranted || false,
          initialInterval: membershipType.interval,
          initialPeriods: plo.periods,
          createdAt: now,
          updatedAt: now,
        }

        if (
          c === 0 &&
          !membershipPeriod &&
          !userHasActiveMembership &&
          pkg.isAutoActivateUserMembership &&
          !plo.packageOption.accessGranted
        ) {
          membershipPeriod = {
            pledgeOptionId: plo.id,
            beginDate: now,
            endDate: now
              .clone()
              .add(membership.initialPeriods, membership.initialInterval),
            membership,
          }
        } else {
          // Add active and uncancelled memberships to list of cancellable
          // memberships if package has truthy isAutoActivateUserMembership
          // flag set (indicating, it's not a giftable membership and should)
          // be activated once an active membership ends (changeover).
          if (pkg.isAutoActivateUserMembership) {
            cancelableMemberships = activeMemberships.filter(
              (m) => m.renew === true,
            )
          }

          debug({ activeMemberships, cancelableMemberships })

          memberships.push(membership)
        }
      }
    }
  })

  debug('generateMemberships membershipPeriod %O', membershipPeriod)
  debug('generateMemberships memberships %O', memberships)

  if (memberships.length) {
    await pgdb.public.memberships.insert(memberships)
  }

  if (cancelableMemberships.length > 0) {
    debug('cancel memberships, is an upgrade', {
      ids: cancelableMemberships.map((m) => m.id),
    })

    const details = {
      type: 'SYSTEM',
      reason: 'Auto Cancellation (generateMemberships)',
      suppressConfirmation: true,
      suppressWinback: true,
    }

    await Promise.map(cancelableMemberships, async (membership) =>
      cancelMembership(membership, details, {}, t, pgdb),
    )
  }

  if (membershipPeriod) {
    const membership = await pgdb.public.memberships.insertAndGet({
      ...membershipPeriod.membership,
      active: true,
      renew: true,
      voucherable: false,
    })
    await pgdb.public.membershipPeriods.insert({
      membershipId: membership.id,
      pledgeId: membership.pledgeId,
      beginDate: membershipPeriod.beginDate,
      endDate: membershipPeriod.endDate,
      createdAt: now,
      updatedAt: now,
    })

    subscribeToEditorialNewsletters = true
  }

  try {
    await mail.enforceSubscriptions({
      pgdb,
      userId: user.id,
      isNew: !user.verified,
      subscribeToOnboardingMails,
      subscribeToEditorialNewsletters,
    })
  } catch (e) {
    console.warn(
      'enforceSubscriptions failed in generateMemberships. This error is ignored, continuing...',
      e,
    )
  }

  const cache = createCache({ prefix: `User:${user.id}` }, { redis })
  cache.invalidate()
}

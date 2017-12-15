const debug = require('debug')('crowdfundings:webhooks:stripe')
const getStripeClients = require('./clients')
const _ = {
  get: require('lodash/get')
}

module.exports = async ({ pgdb }) => {
  const {
    provider,
    connectedAccounts
  } = await getStripeClients(pgdb)

  const typesOfIntereset = [
    'invoice.payment_succeeded',
    'charge.succeeded',
    'customer.subscription.deleted',
    'customer.subscription.updated'
  ]

  return async ({
    req,
    connected = false
  }) => {
    // check event
    let event
    try {
      // all events for connected accounts share the same secret
      const account = connected
        ? connectedAccounts[0]
        : provider

      event = account.stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        account.endpointSecret
      )
    } catch (e) {
      console.error(e)
      return 400
    }

    if (typesOfIntereset.indexOf(event.type) > -1) {
      debug('%O', event)

      /*
      const account = event.accountId
        ? accounts.find( a => a.accountId === event.account )
        : provider
      if (!account) {
        throw new Error("stripe handleWebhook didn't find local account for event")
      }
      */

      // invoice.payment_succeeded includes:
      // pledgeId, charge total and charge id
      // but not the charge details, charge may not
      // exists at the time this hook is received
      if (event.type === 'invoice.payment_succeeded') {
        const invoice = _.get(event, 'data.object')
        const subscription = _.get(event, 'data.object.lines.data[0]')
        if (subscription.type === 'subscription') {
          const {
            charge: chargeId,
            total
          } = invoice
          const pledgeId = subscription.metadata.pledgeId

          const transaction = await pgdb.transactionBegin()
          try {
            // synchronize with payPledge
            await transaction.query(`
              SELECT *
              FROM pledges
              WHERE id = :pledgeId
              FOR UPDATE
            `, {
              pledgeId
            })
              .then(response => response[0])

            const existingPayments = await transaction.public.payments.find({
              method: 'STRIPE',
              pspId: chargeId
            })

            if (!existingPayments.length) {
              // the first membershipPeriod is inserted by generateMemberships
              const payment = await transaction.public.payments.insertAndGet({
                type: 'PLEDGE',
                method: 'STRIPE',
                total: total,
                status: 'PAID',
                pspId: chargeId
              })

              await transaction.public.pledgePayments.insert({
                pledgeId,
                paymentId: payment.id,
                paymentType: 'PLEDGE'
              })
            } else {
              // insert membershipPeriods
              const beginDate = new Date(subscription.period.start)
              const endDate = new Date(subscription.period.end)
              const memberships = await transaction.public.memberships.find({
                pledgeId
              })
              await Promise.all(memberships.map(membership => {
                return transaction.public.membershipPeriods.insert({
                  membershipId: membership.id,
                  beginDate,
                  endDate
                })
              }))
              await transaction.public.memberships.update({
                id: memberships.map(m => m.id)
              }, {
                active: true
              })
            }
            await transaction.transactionCommit()
          } catch (e) {
            await transaction.transactionRollback()
            console.info('transaction rollback', { error: e })
            console.error(e)
            throw e
          }
        }
      // charge.succeeded contains all the charge details
      // but not the pledgeId
      // if this event arrives before invoi.payment_succeeded
      // we reject it and wait for it to come again
      } else if (event.type === 'charge.succeeded') {
        const charge = _.get(event, 'data.object')
        const transaction = await pgdb.transactionBegin()
        try {
          const existingPayment = await transaction.query(`
            SELECT *
            FROM payments
            WHERE "pspId" = :pspId
            FOR UPDATE
          `, {
            pspId: charge.id
          })
            .then(response => response[0])

          if (existingPayment) {
            await transaction.public.payments.update({
              id: existingPayment.id
            }, {
              pspPayload: charge
            })
          } else {
            debug('no existing payment found in charge.succeeded. rejecting event %O', event)
            await transaction.transactionRollback()
            return 503
          }

          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          console.info('transaction rollback', { error: e })
          console.error(e)
          throw e
        }
      } else if (event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object
        const pledgeId = subscription.metadata.pledgeId

        const transaction = await pgdb.transactionBegin()
        try {
          const pledge = await transaction.query(`
            SELECT *
            FROM pledges
            WHERE id = :pledgeId
            FOR UPDATE
          `, {
            pledgeId
          })
            .then(response => response[0])
          if (!pledge) {
            throw new Error('pledge for customer.subscription event not found! subscriptionId:' + subscription.id)
          }

          const memberships = await transaction.public.memberships.find({
            pledgeId
          })
          if (!memberships.length) {
            throw new Error('pledge for customer.subscription event has no memberships! subscriptionId:' + subscription.id)
          }

          // Possible values are trialing, active, past_due, canceled, or unpaid
          // https://stripe.com/docs/api/node#subscription_object
          if (subscription.status === 'canceled') {
            await transaction.public.memberships.update({
              pledgeId
            }, {
              renew: false
            })
          } else if (subscription.status === 'unpaid') {
            // we might ignore this event and do it in a local cron
            await transaction.public.memberships.update({
              pledgeId
            }, {
              active: false
            })
          }
          await transaction.transactionCommit()
        } catch (e) {
          await transaction.transactionRollback()
          console.info('transaction rollback', { error: e })
          console.error(e)
          throw e
        }
      } else {
        throw new Error('missing handler for event type: ' + event.type)
      }
    } else {
      debug(`webhookHandler ignoring event with type: ${event.type}`)
    }
    return 200
  }
}

const { Roles } = require('@orbiting/backend-modules-auth')

const { parse, stringify, isKeyValid } = require('../../../lib/utils')

module.exports = async (_, args, context) => {
  const { id, userId } = args
  const { user: me, pgdb, loaders, t } = context

  const { calendarSlug, key } = parse(id)

  if (!isKeyValid(key)) {
    throw new Error(t('api/calendar/slot/error/keyInvalid'))
  }

  const calendar = await loaders.Calendar.bySlug.load(calendarSlug)
  if (!calendar) {
    throw new Error(t('api/calendar/404'))
  }

  const isMyself = !userId || me.id === userId
  const user = isMyself ? me : await loaders.User.byId.load(userId)
  if (!user) {
    throw new Error(t('api/users/404'))
  }

  if (
    calendar.limitRoles?.length &&
    !Roles.userIsInRoles(user, calendar.limitRoles)
  ) {
    t.pluralize('api/unauthorized', {
      count: calendar.limitRoles.length,
      role: calendar.limitRoles.map((r) => `«${r}»`).join(', '),
    })
  }

  const userSlots = await loaders.CalendarSlot.byKeyObj.load({
    calendarSlug: calendar.slug,
    key,
    revokedAt: null,
  })

  const userHasBooked = !!userSlots.find(
    (slot) => slot.key === key && slot.userId === user.id,
  )
  if (userHasBooked) {
    throw new Error(t('api/calendar/slot/error/userBookedAlready'))
  }

  const someoneHasBooked = !!userSlots.find(
    (slot) => slot.key === key && slot.userId !== user.id,
  )
  if (someoneHasBooked) {
    throw new Error(t('api/calendar/slot/error/someoneBookAlready'))
  }

  await pgdb.public.calendarSlots.insertAndGet({
    calendarSlug,
    userId: user.id,
    key,
  })

  return {
    id: stringify({ calendarSlug: calendar.slug, key }),
    key,
    userCanBook: false,
    userHasBooked: true,
    userCanCancel: true,
  }
}

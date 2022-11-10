const dayjs = require('dayjs')

const { stringify } = require('../../lib/utils')

const MAX_SLOTS = 31 * 2 // 2 months-ish

module.exports = {
  id: (calendar, args, context) => {
    return stringify({ calendarSlug: calendar.slug })
  },
  slots: async (calendar, args, context) => {
    const { __user: user } = calendar
    const { from, to } = args
    const { loaders } = context

    const firstDate = dayjs(from)
    const lastDate = dayjs(to)
    const days = []

    for (
      let date = firstDate;
      date <= lastDate && days.length < MAX_SLOTS;
      date = date.clone().add(1, 'day')
    ) {
      days.push({ date, key: date.format('YYYY-MM-DD') })
    }

    const userSlots = await loaders.CalendarSlot.byKeyObj.load({
      calendarSlug: calendar.slug,
      key: days.map((day) => day.key),
      revokedAt: null,
    })

    const today = dayjs().startOf('day')

    return days.map(({ date, key }) => {
      const isInFuture = !today.isAfter(date)

      const userHasBooked = !!userSlots.find(
        (slot) => slot.key === key && slot.userId === user.id,
      )
      const someoneHasBooked = !!userSlots.find(
        (slot) => slot.key === key && slot.userId !== user.id,
      )
      const userCanBook = isInFuture && !userHasBooked && !someoneHasBooked
      const userCanCancel = isInFuture && userHasBooked && !someoneHasBooked

      return {
        id: stringify({ calendarSlug: calendar.slug, key }),
        key,
        userCanBook,
        userHasBooked,
        userCanCancel,
      }
    })
  },
}

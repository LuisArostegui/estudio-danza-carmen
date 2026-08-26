import {defineArrayMember, defineField, defineType} from 'sanity'

export const schedule = defineType({
  name: 'schedule',
  title: 'Schedule',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'effectiveFrom', title: 'Effective from', type: 'date'}),
    defineField({
      name: 'effectiveTo',
      title: 'Effective to',
      type: 'date',
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = context.document?.effectiveFrom
          if (startDate && endDate && new Date(String(endDate)) < new Date(String(startDate)))
            return 'Effective to must be after effective from'
          return true
        }),
    }),
    defineField({name: 'notes', title: 'Public notes', type: 'text', rows: 3}),
    defineField({
      name: 'slots',
      title: 'Slots',
      type: 'array',
      of: [defineArrayMember({type: 'scheduleSlot'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
})

export const scheduleSlot = defineType({
  name: 'scheduleSlot',
  title: 'Schedule slot',
  type: 'object',
  fields: [
    defineField({
      name: 'class',
      title: 'Class',
      type: 'reference',
      to: [{type: 'class'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'day',
      title: 'Day',
      type: 'string',
      options: {
        list: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startTime',
      title: 'Start time',
      type: 'string',
      validation: (rule) =>
        rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'HH:mm 24-hour time'}).required(),
    }),
    defineField({
      name: 'endTime',
      title: 'End time',
      type: 'string',
      validation: (rule) =>
        rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {name: 'HH:mm 24-hour time'}).required(),
    }),
    defineField({name: 'room', title: 'Room', type: 'string'}),
    defineField({name: 'levelOrGroup', title: 'Level or group note', type: 'string'}),
    defineField({name: 'teacher', title: 'Teacher', type: 'reference', to: [{type: 'teacher'}]}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number'}),
    defineField({name: 'temporalNotes', title: 'Temporal notes', type: 'string'}),
  ],
})

import {defineArrayMember, defineField, defineType} from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'title'}}),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'body', title: 'Body', type: 'portableCopy'}),
    defineField({name: 'startDate', title: 'Start date', type: 'date'}),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
      validation: (rule) =>
        rule.custom((endDate, context) => {
          const startDate = context.document?.startDate
          if (startDate && endDate && new Date(String(endDate)) < new Date(String(startDate)))
            return 'End date must be after start date'
          return true
        }),
    }),
    defineField({name: 'seasonLabel', title: 'Season label', type: 'string'}),
    defineField({
      name: 'relatedClasses',
      title: 'Related classes',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'class'}]})],
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [defineArrayMember({type: 'mediaItem'})],
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      options: {list: ['upcoming', 'current', 'past', 'hidden'], layout: 'radio'},
      initialValue: 'upcoming',
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
    defineField({name: 'order', title: 'Display order', type: 'number'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

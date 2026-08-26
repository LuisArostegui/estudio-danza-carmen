import {defineArrayMember, defineField, defineType} from 'sanity'

export const performance = defineType({
  name: 'performance',
  title: 'Performance',
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
    defineField({name: 'performanceDate', title: 'Performance date', type: 'date'}),
    defineField({name: 'venue', title: 'Venue', type: 'string'}),
    defineField({name: 'isUpcoming', title: 'Upcoming', type: 'boolean'}),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [defineArrayMember({type: 'mediaItem'})],
    }),
    defineField({
      name: 'relatedClasses',
      title: 'Related classes',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'class'}]})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

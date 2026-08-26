import {defineField, defineType} from 'sanity'

export const legalContent = defineType({
  name: 'legalContent',
  title: 'Legal content',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableCopy',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'lastReviewed', title: 'Last reviewed', type: 'date'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

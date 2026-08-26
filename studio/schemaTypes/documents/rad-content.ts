import {defineArrayMember, defineField, defineType} from 'sanity'

export const radContent = defineType({
  name: 'radContent',
  title: 'RAD content',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verifiedClaims',
      title: 'Verified public claims',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'pendingClaims',
      title: 'Draft-only pending claims',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'relatedClasses',
      title: 'Related classes',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'class'}]})],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [defineArrayMember({type: 'mediaItem'})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

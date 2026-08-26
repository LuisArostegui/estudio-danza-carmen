import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (rule) => rule.max(60).warning('Recommended maximum is 60 characters'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(155).warning('Recommended maximum is 155 characters'),
    }),
    defineField({name: 'canonicalOverride', title: 'Canonical override', type: 'url'}),
    defineField({name: 'ogImage', title: 'Open Graph image', type: 'mediaItem'}),
    defineField({name: 'noIndex', title: 'No index', type: 'boolean', initialValue: false}),
  ],
})

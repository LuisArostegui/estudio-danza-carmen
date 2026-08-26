import {defineArrayMember, defineField, defineType} from 'sanity'

export const classDocument = defineType({
  name: 'class',
  title: 'Class',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) =>
        rule.custom((slug, context) =>
          context.document?.hasDetailPage && !slug?.current
            ? 'Slug is required when this class has a detail page'
            : true,
        ),
    }),
    defineField({
      name: 'hasDetailPage',
      title: 'Has detail page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Ballet', value: 'ballet'},
          {title: 'Body Work', value: 'body-work'},
          {title: 'Other Discipline', value: 'other-discipline'},
          {title: 'Private Training', value: 'private-training'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.required().max(180).warning('Recommended maximum is 180 characters'),
    }),
    defineField({name: 'audience', title: 'Audience', type: 'string'}),
    defineField({name: 'ageRange', title: 'Age range', type: 'string'}),
    defineField({name: 'level', title: 'Level', type: 'string'}),
    defineField({name: 'longDescription', title: 'Long description', type: 'portableCopy'}),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [defineArrayMember({type: 'mediaItem'})],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
    }),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'cta'}),
    defineField({name: 'order', title: 'Display order', type: 'number'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

import {defineArrayMember, defineField, defineType} from 'sanity'

export const contactContent = defineType({
  name: 'contactContent',
  title: 'Contact content',
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
    defineField({name: 'directions', title: 'Directions', type: 'text', rows: 4}),
    defineField({
      name: 'contactBlocks',
      title: 'Contact blocks',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'formIntro', title: 'Form intro', type: 'text', rows: 3}),
    defineField({name: 'privacyNote', title: 'Privacy note', type: 'text', rows: 3}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
})

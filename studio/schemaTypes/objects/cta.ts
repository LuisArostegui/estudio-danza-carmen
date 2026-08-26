import {defineField, defineType} from 'sanity'

export const cta = defineType({
  name: 'cta',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'href',
      title: 'URL or path',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Primary', value: 'primary'},
          {title: 'Secondary', value: 'secondary'},
          {title: 'Text', value: 'text'},
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'match',
      title: 'Navigation active match',
      type: 'string',
      description: 'Use Section for navigation items that should remain active on nested pages.',
      options: {
        list: [
          {title: 'Exact path', value: 'exact'},
          {title: 'Section path', value: 'section'},
        ],
        layout: 'radio',
      },
      initialValue: 'exact',
    }),
  ],
})

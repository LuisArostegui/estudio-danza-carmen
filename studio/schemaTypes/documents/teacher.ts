import {defineArrayMember, defineField, defineType} from 'sanity'

export const teacher = defineType({
  name: 'teacher',
  title: 'Teacher',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'slug', title: 'Slug', type: 'slug', options: {source: 'name'}}),
    defineField({
      name: 'role',
      title: 'Public role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'biography', title: 'Biography', type: 'portableCopy'}),
    defineField({name: 'portrait', title: 'Portrait', type: 'mediaItem'}),
    defineField({
      name: 'qualifications',
      title: 'Public qualifications',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'relevantClasses',
      title: 'Relevant classes',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'class'}]})],
    }),
    defineField({name: 'order', title: 'Display order', type: 'number'}),
  ],
})

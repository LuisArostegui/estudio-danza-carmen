import {defineField, defineType} from 'sanity'

export const homeCard = defineType({
  name: 'homeCard',
  title: 'Tarjeta editorial de Home',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Etiqueta pequena',
      description: 'Texto opcional en mayusculas encima del titulo.',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Titulo',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkLabel',
      title: 'Texto del enlace',
      description: 'Opcional. Si lo rellenas, rellena tambien la URL.',
      type: 'string',
    }),
    defineField({
      name: 'href',
      title: 'URL o ruta del enlace',
      description: 'Ejemplo: /classes/ o /contact/.',
      type: 'string',
      hidden: ({parent}) => !parent?.linkLabel,
      validation: (rule) =>
        rule.custom((href, context) => {
          const parent = context.parent as {linkLabel?: string} | undefined

          if (parent?.linkLabel && !href) return 'Required when link text is set.'

          return true
        }),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'text'},
  },
})

import {defineField, defineType} from 'sanity'

export const homeContent = defineType({
  name: 'homeContent',
  title: 'Inicio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titular principal',
      description:
        'Texto grande que aparece sobre la imagen principal. Puedes usar saltos de linea.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scriptLabel',
      title: 'Texto decorativo superior',
      description: 'Frase manuscrita que aparece encima del titular principal.',
      type: 'string',
      initialValue: 'Dance with soul',
    }),
    defineField({
      name: 'intro',
      title: 'Texto introductorio del hero',
      description: 'Parrafo corto debajo del titular principal.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryCta',
      title: 'Boton principal',
      description: 'Boton rosa del hero.',
      type: 'cta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Enlace secundario',
      description: 'Enlace subrayado que aparece junto al boton principal.',
      type: 'cta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroMedia',
      title: 'Imagen principal',
      description:
        'Imagen de fondo del hero. Dejalo vacio si quieres usar la imagen temporal del proyecto.',
      type: 'mediaItem',
    }),
    defineField({
      name: 'academyEyebrow',
      title: 'Etiqueta de la seccion academia',
      description: 'Texto pequeno en mayusculas antes del titulo de academia.',
      type: 'string',
      initialValue: 'Academia',
    }),
    defineField({
      name: 'academyTitle',
      title: 'Titulo de la seccion academia',
      description: 'Titulo del bloque que aparece debajo del hero.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'academyIntro',
      title: 'Texto de la seccion academia',
      description: 'Parrafo corto del bloque que aparece debajo del hero.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredClasses',
      title: 'Clases destacadas',
      description: 'Se usara mas adelante para enlazar clases destacadas en la home.',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'class'}]}],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      description:
        'Campos opcionales para buscadores y redes sociales. Puedes dejarlos vacios ahora.',
      type: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'intro'},
  },
})

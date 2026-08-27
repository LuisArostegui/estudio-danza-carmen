import {defineArrayMember, defineField, defineType} from 'sanity'

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
      name: 'classPathwaysEyebrow',
      title: 'Etiqueta de clases',
      type: 'string',
      initialValue: 'Clases',
    }),
    defineField({
      name: 'classPathwaysTitle',
      title: 'Titulo de clases',
      type: 'string',
    }),
    defineField({
      name: 'classPathwaysIntro',
      title: 'Texto de clases',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'classPathways',
      title: 'Caminos de clases',
      description: 'Tarjetas principales que enlazan con la oferta de clases.',
      type: 'array',
      of: [defineArrayMember({type: 'homeCard'})],
    }),
    defineField({
      name: 'planningEyebrow',
      title: 'Etiqueta de planificacion',
      type: 'string',
    }),
    defineField({
      name: 'planningTitle',
      title: 'Titulo de planificacion',
      type: 'string',
    }),
    defineField({
      name: 'planningIntro',
      title: 'Texto de planificacion',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'planningCards',
      title: 'Tarjetas de planificacion',
      type: 'array',
      of: [defineArrayMember({type: 'homeCard'})],
    }),
    defineField({
      name: 'trustEyebrow',
      title: 'Etiqueta de confianza',
      type: 'string',
    }),
    defineField({
      name: 'trustTitle',
      title: 'Titulo de confianza',
      type: 'string',
    }),
    defineField({
      name: 'trustIntro',
      title: 'Texto de confianza',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'trustItems',
      title: 'Puntos de confianza',
      type: 'array',
      of: [defineArrayMember({type: 'homeCard'})],
    }),
    defineField({
      name: 'discoveryEyebrow',
      title: 'Etiqueta de descubrimiento',
      type: 'string',
    }),
    defineField({
      name: 'discoveryTitle',
      title: 'Titulo de descubrimiento',
      type: 'string',
    }),
    defineField({
      name: 'discoveryCards',
      title: 'Tarjetas de descubrimiento',
      type: 'array',
      of: [defineArrayMember({type: 'homeCard'})],
    }),
    defineField({
      name: 'finalPrompt',
      title: 'Bloque final de contacto',
      type: 'object',
      fields: [
        defineField({name: 'eyebrow', title: 'Etiqueta', type: 'string'}),
        defineField({name: 'title', title: 'Titulo', type: 'string'}),
        defineField({name: 'intro', title: 'Texto', type: 'text', rows: 3}),
        defineField({name: 'primaryCta', title: 'Boton principal', type: 'cta'}),
        defineField({name: 'secondaryCta', title: 'Enlace secundario', type: 'cta'}),
      ],
    }),
    defineField({
      name: 'featuredClasses',
      title: 'Clases destacadas',
      description: 'Reservado para enlazar documentos de clase cuando se implemente CD-25.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'class'}]})],
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

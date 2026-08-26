import type {StructureResolver} from 'sanity/structure'

const singletonTypes = new Set(['siteSettings', 'homeContent', 'radContent', 'contactContent'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Carmen Danza')
    .items([
      S.listItem()
        .title('Ajustes del sitio')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Inicio')
        .id('homeContent')
        .child(S.document().schemaType('homeContent').documentId('homeContent')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !singletonTypes.has(item.getId() ?? '')),
      S.divider(),
      S.listItem()
        .title('RAD')
        .id('radContent')
        .child(S.document().schemaType('radContent').documentId('radContent')),
      S.listItem()
        .title('Contacto')
        .id('contactContent')
        .child(S.document().schemaType('contactContent').documentId('contactContent')),
    ])

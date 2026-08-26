import {defineField, defineType} from 'sanity'

const licenceStatuses = [
  {title: 'Approved', value: 'approved'},
  {title: 'Pending verification', value: 'pending verification'},
  {title: 'Needs consent', value: 'needs consent'},
  {title: 'Reference only', value: 'reference only'},
  {title: 'Do not publish', value: 'do not publish'},
]

interface MediaItemParent {
  asset?: unknown
  decorative?: boolean
}

function hasAsset(parent: unknown): parent is MediaItemParent {
  return Boolean((parent as MediaItemParent | undefined)?.asset)
}

export const mediaItem = defineType({
  name: 'mediaItem',
  title: 'Media item',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative image',
      type: 'boolean',
      initialValue: false,
      hidden: ({parent}) => !hasAsset(parent),
    }),
    defineField({
      name: 'altText',
      title: 'Alt text',
      type: 'string',
      hidden: ({parent}) => !hasAsset(parent) || parent?.decorative === true,
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as MediaItemParent | undefined
          if (!hasAsset(parent) || parent.decorative) return true
          return value ? true : 'Alt text is required unless the image is decorative'
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      hidden: ({parent}) => !hasAsset(parent),
    }),
    defineField({
      name: 'licenceStatus',
      title: 'Licence status',
      type: 'string',
      options: {list: licenceStatuses, layout: 'radio'},
      initialValue: 'pending verification',
      hidden: ({parent}) => !hasAsset(parent),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as MediaItemParent | undefined
          if (!hasAsset(parent)) return true
          return value ? true : 'Licence status is required when an image is selected'
        }),
    }),
    defineField({
      name: 'consentStatus',
      title: 'Consent status',
      type: 'string',
      options: {
        list: [
          {title: 'Yes', value: 'yes'},
          {title: 'No', value: 'no'},
          {title: 'Pending', value: 'pending'},
        ],
        layout: 'radio',
      },
      hidden: ({parent}) => !hasAsset(parent),
    }),
    defineField({
      name: 'credit',
      title: 'Public credit',
      type: 'string',
      hidden: ({parent}) => !hasAsset(parent),
    }),
    defineField({
      name: 'usageNotes',
      title: 'Public-safe usage notes',
      type: 'text',
      rows: 3,
      hidden: ({parent}) => !hasAsset(parent),
    }),
  ],
})

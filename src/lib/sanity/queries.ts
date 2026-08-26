const mediaProjection = `{
  asset,
  altText,
  decorative,
  caption,
  licenceStatus,
  consentStatus,
  credit,
  usageNotes
}`;

const navigationProjection = `[]{
  label,
  href,
  style,
  match
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  "siteName": coalesce(siteName, ""),
  "brandLabel": coalesce(brandLabel, siteName, ""),
  "topbarMessage": coalesce(topbarMessage, ""),
  "address": coalesce(address, ""),
  email,
  phone,
  "phoneLabel": coalesce(phoneLabel, phone, ""),
  "footerNote": coalesce(footerNote, ""),
  "headerNavigation": coalesce(headerNavigation, primaryNavigation)${navigationProjection},
  "footerPrimaryTitle": coalesce(footerPrimaryTitle, ""),
  "footerPrimaryNavigation": coalesce(footerPrimaryNavigation, primaryNavigation)${navigationProjection},
  "footerSecondaryTitle": coalesce(footerSecondaryTitle, ""),
  "footerSecondaryNavigation": footerSecondaryNavigation${navigationProjection},
  "footerLegalTitle": coalesce(footerLegalTitle, ""),
  "footerLegalNavigation": footerLegalNavigation${navigationProjection},
  "mainNavigationLabel": coalesce(mainNavigationLabel, ""),
  "mobileNavigationLabel": coalesce(mobileNavigationLabel, mainNavigationLabel, ""),
  "footerNavigationLabel": coalesce(footerNavigationLabel, ""),
  "searchLabel": coalesce(searchLabel, ""),
  "menuLabel": coalesce(menuLabel, "")
}`;

export const homeContentQuery = `*[_type == "homeContent"][0]{
  "title": coalesce(title, ""),
  "scriptLabel": coalesce(scriptLabel, "Dance with soul"),
  "intro": coalesce(intro, ""),
  "primaryCta": coalesce(primaryCta, featuredLinks[0]),
  "secondaryCta": coalesce(secondaryCta, featuredLinks[1]),
  "academyEyebrow": coalesce(academyEyebrow, "Academia"),
  "academyTitle": coalesce(academyTitle, title),
  "academyIntro": coalesce(academyIntro, intro),
  "heroMedia": select(defined(heroMedia.asset) => heroMedia${mediaProjection})
}`;

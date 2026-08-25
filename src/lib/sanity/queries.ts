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

export const homeContentQuery = `*[_type == "homeContent"][0]{
  "title": coalesce(title, ""),
  "scriptLabel": coalesce(scriptLabel, "Dance with soul"),
  "intro": coalesce(intro, ""),
  "primaryCta": coalesce(primaryCta, featuredLinks[0]),
  "secondaryCta": coalesce(secondaryCta, featuredLinks[1]),
  "academyEyebrow": coalesce(academyEyebrow, "Academia"),
  "academyTitle": coalesce(academyTitle, title),
  "academyIntro": coalesce(academyIntro, intro),
  "heroMedia": heroMedia${mediaProjection}
}`;

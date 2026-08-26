import {classDocument} from './documents/class'
import {contactContent} from './documents/contact-content'
import {course} from './documents/course'
import {facility} from './documents/facility'
import {homeContent} from './documents/home-content'
import {legalContent} from './documents/legal-content'
import {performance} from './documents/performance'
import {radContent} from './documents/rad-content'
import {schedule, scheduleSlot} from './documents/schedule'
import {siteSettings} from './documents/site-settings'
import {teacher} from './documents/teacher'
import {cta} from './objects/cta'
import {faqItem} from './objects/faq-item'
import {mediaItem} from './objects/media-item'
import {portableCopy} from './objects/portable-copy'
import {seo} from './objects/seo'

export const schemaTypes = [
  cta,
  faqItem,
  mediaItem,
  portableCopy,
  seo,
  homeContent,
  siteSettings,
  classDocument,
  teacher,
  schedule,
  scheduleSlot,
  facility,
  course,
  performance,
  radContent,
  contactContent,
  legalContent,
]

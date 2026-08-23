# MVP Sitemap And Navigation

This document defines the first-release information architecture. It does not implement routes or page layouts.

## Route Families

| Route | Page | Purpose | Owner |
| --- | --- | --- | --- |
| `/` | Home | Introduce the school, guide visitors to classes, schedules, RAD, and contact. | Content / Design |
| `/classes/` | Classes index | Explain the class offer and group disciplines in a scannable way. | Content |
| `/classes/[slug]/` | Class detail | Give the explicitly selected MVP class categories a focused page with independent copy, schedule links, and conversion paths. | Content |
| `/schedules/` | Schedules | Help students and families understand when classes happen. | Content |
| `/teachers/` | Teachers | Present the teaching team and trust signals. | Content |
| `/facilities/` | Facilities | Show the studio space and practical context. | Content / Design |
| `/performances/` | Performances | Present school performances and stage experience. | Content |
| `/courses/` | Courses | Explain limited courses or intensive formats. | Content |
| `/rad/` | Royal Academy of Dance | Explain RAD as a differentiator, with claims verified before publication. | Content |
| `/contact/` | Contact | Provide address, contact options, enquiry flow, and practical next steps. | Content / Forms |
| `/legal/legal-notice/` | Legal notice | Provide required ownership and legal information. | Legal |
| `/legal/privacy-policy/` | Privacy policy | Explain personal data handling. | Legal |
| `/legal/cookie-policy/` | Cookie policy | Explain cookies if integrations make this necessary. | Legal |

## Class Routing Strategy

`/classes/` is the hub for all class families. The MVP includes a small, explicit set of class detail pages for the offers most likely to need independent copy, schedule context, and search visibility.

MVP class detail pages:

| Route | Class Category | Notes |
| --- | --- | --- |
| `/classes/diverballet/` | Diverballet | Child-focused ballet introduction with age/context copy confirmed during content modelling. |
| `/classes/pre-ballet/` | Pre Ballet | Early ballet training page for families comparing children's classes. |
| `/classes/ballet-levels/` | Ballet by level | Main ballet training path for regular students, including beginner and intermediate progression where appropriate. |
| `/classes/adult-ballet/` | Adult Ballet | Adult-focused ballet page with its own audience, intent, and practical questions. |
| `/classes/pointe-technique/` | Pointe Technique | Specialist ballet page where prerequisites, level, and safety context need focused copy. |
| `/classes/classical-repertoire/` | Classical Repertoire | Specialist ballet page for repertoire work and performance-oriented training. |
| `/classes/private-sessions/` | Private Sessions | Conversion-oriented page for one-to-one or tailored training enquiries. |
| `/classes/pilates/` | Pilates | Body-work page with enough independent search and enquiry intent to justify a route. |
| `/classes/barre/` | Barre | Body-work page with enough independent search and enquiry intent to justify a route. |

Grouped initially on `/classes/` without individual MVP pages:

| Group | Includes | Routing Notes |
| --- | --- | --- |
| Body Work | Physical conditioning, senior gymnastics, women's health. | Keep visible in the Classes hub until content depth justifies dedicated pages. |
| Other Disciplines | Sevillanas, urban dance, contemporary, wedding/event dances, ballroom dance. | Keep discoverable without overloading primary navigation. |

Class slugs should be simple, lowercase, descriptive, and stable. Final slugs should be confirmed during content modelling.

## Primary Navigation

Primary navigation should stay compact and work conceptually on both desktop and mobile:

| Label | Destination | Notes |
| --- | --- | --- |
| Inicio | `/` | Home. |
| Clases | `/classes/` | Main class hub, not a long list of every discipline. |
| Horarios | `/schedules/` | High-intent practical destination. |
| Profesorado | `/teachers/` | Trust and team. |
| RAD | `/rad/` | Important differentiator. |
| Contacto | `/contact/` | Main conversion path. |

Facilities, performances, and courses should remain discoverable through Home, contextual links, footer navigation, and relevant page content. They do not need to overload the primary navigation unless later design work proves they should.

## Footer Navigation

Footer navigation should include:

- Primary destinations: Home, Classes, Schedules, Teachers, RAD, Contact.
- Secondary destinations: Facilities, Performances, Courses.
- Legal destinations: Legal notice, Privacy policy, Cookie policy if required.
- Business information: address and contact details once verified.
- Social links only when official URLs are confirmed.

## Contextual Links

Use contextual links to help visitors move naturally:

| From | Link To | Purpose |
| --- | --- | --- |
| Home | Classes | Help new visitors understand the offer. |
| Home | Schedules | Support practical planning. |
| Home | RAD | Surface a trust differentiator. |
| Home | Contact | Convert interest into enquiry. |
| Class detail | Schedules | Connect offer to availability. |
| Class detail | Contact | Encourage enquiry before enrolment. |
| RAD | Classes | Connect RAD information with relevant training paths. |
| Courses | Contact | Support questions and enrolment intent. |
| Performances | Contact | Support participation or information requests. |

## Deferred Routes

The following are outside the first release:

- `/blog/`.
- `/gift-dance/`.
- `/friday-events/`.
- Booking flows.
- Payment flows.
- Ecommerce.

They should not appear in primary navigation until a later issue brings them into scope.

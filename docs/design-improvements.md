# Design improvements proposal

Date: 2026-11-18. Method: `frontend-design` skill (plan → review against brief →
prioritise) plus a scan of reference ballet sites. Full research notes were kept
in the session scratchpad; the references below are the ones actually loaded.

## References that informed this

| Site | What is worth borrowing |
| --- | --- |
| [Milwaukee Ballet](https://milwaukeeballet.org) | Full-bleed dark-blue stage photo, one clear CTA, very little chrome. |
| [The Australian Ballet](https://australianballet.com.au) | Calm editorial rhythm, one typeface, filled + outlined buttons, generous space. |
| [Pacific Northwest Ballet School](https://www.pnb.org/school/) | Class cards titled with the age band, verb CTAs, history/faculty anchors. |
| [Boston Ballet School](https://www.bostonballet.org/education/) | Close-up of feet at the barre used as a wide, quiet banner. |
| [Scottish Ballet](https://scottishballet.co.uk) | Light display serif paired with a sans, one accent colour. |
| [Royal Ballet School](https://www.royalballetschool.org.uk) | History lock-up ("100 years") as a trust cue; avoid its busy carousel. |

## Design plan (kept inside Elena's brief)

Elena's brief fixes the identity: white header over a dark stage, soft pink,
Montserrat with calligraphic accents, a more comfortable scale than Arabesque.
Where the brief is silent, choose deliberately instead of falling back on
template defaults.

- **Palette:** stage blue-black `#07060b` (only behind stage photos), white
  `#ffffff`, pale `#fbf9f9`, soft pink `#fdd8d6` (buttons and one accent only),
  body grey `#6c6c6c`, ink `#000`.
- **Type:** Montserrat for everything. Uppercase stays for the H1 and section
  titles, as Elena asked, and for nothing else. Pinyon Script appears at most
  once per screen. Optional variant for Elena: a light display serif for the H1
  only (see decision D3).
- **Layout:** stage photography in dark sections, studio photography in pale
  sections, never two dark bands in a row. Text left-aligned except the short
  centred story block.
- **The one memorable thing:** the school's own stage light, the deep blue of its
  performance photos. Everything else stays quiet.

### Review against the brief (what changed and why)

- Research suggested a transparent header over the hero. **Rejected:** Elena
  explicitly wants the contrast of a white header over a dark scene.
- Research suggested replacing Montserrat headings with a serif. **Downgraded to
  an optional variant:** the brief keeps the current typography.
- Numbered markers (01–04) on class cards: first dropped as a template tell,
  then **restored** after reading Elena's `02 - MENU.pdf`, which numbers the four
  class cards explicitly and uses the Arabesque numbered-card layout as reference.
- A pale "Nuestra historia" section was proposed, then **rejected**: the PDF's
  reference for that block is the Arabesque black section with a script accent.
- Elena's PDF (p. 17) also asks for the map next to the contact details.

## Prioritised improvements

Effort: S = under half a day, M = one to two days, L = more.

| # | Improvement | Why / reference | Effort | Needs from Elena |
| --- | --- | --- | --- | --- |
| 1 | **Done today:** real photos in the hero, class cards, RAD block, ballet landing and the adult page. Hero reworked so the dancers stay visible (photo band on phones, right-hand side on desktop). | Milwaukee, Australian | S | Confirm consent for students on stage |
| 2 | ~~Rejected by Elena's PDF~~ Break up the three dark bands at the top: make "Nuestra historia" a pale section with the feet-at-the-barre photo as a wide banner; keep "Por qué elegirnos" dark. | Boston; avoids heavy, cramped black blocks | S | — |
| 3 | ~~Numbers kept per Elena's PDF~~ Remove the 01–04 numbers on class cards and reasons. Once ages are confirmed, put the age band in each card title ("Diverballet · 3–4 años"). | PNB; numbers imply a sequence that isn't there | S | Confirmed ages per group |
| 4 | Make labels sentence case and cut eyebrows that only repeat the heading (e.g. "Nuestras clases" above "¿Qué te gustaría bailar?"). Keep uppercase only for H1 and section titles. | Australian, Scottish; fewer template tells | S | — |
| 5 | One orchestrated load moment on the hero only (title lines fade in over ~600 ms, off under reduced motion). No fade-in on every section. | Restraint reads as premium | S | — |
| 6 | Compact the ballet landing on phones: two-column cards or a horizontal list, so 8 classes don't make a 6 000 px page. | Mobile scan of all references | S | — |
| 7 | Consistent photo grading: one gentle warm grade for studio photos (lilac walls and wood floors) so they sit with the stage shots. | Scottish, Australian | S–M | Original files from Synology |
| 8 | Gallery: caption always visible on touch (done), add a simple lightbox and lead with 2–3 featured productions instead of 7 equal tiles. | Royal, PNB | M | Which photo belongs to which production, and the year |
| 9 | Visible "clase de prueba" call to action in the hero area and after the class cards, if the school offers trial classes. | None of the references do this well; it is a conversion gap | S | Whether trials exist, price, how to book |
| 10 | Testimonials as two or three large pull quotes with first name and class, no carousel. | PNB, Australian | S | Real, consented reviews |
| 11 | History timeline on "Sobre nosotros" (1988 → today) with archive photos. | Royal "100 years", PNB history | M | Dates, archive photos |
| 12 | Team portraits with name and role. | Central School, PNB faculty | M | Photos, short bios, consent |
| 14 | Map on the contact block (Elena's PDF p. 17), privacy-friendly embed or static map with a link. | Elena's brief | S | Accept third-party map or static image |
| 13 | Optional variant D3: light display serif for the H1 only, compared side by side with the current Montserrat H1. | Scottish, Milwaukee | S | Elena's choice |

### Avoid

Auto-rotating hero carousel, load pop-ups, invented counters ("+500 alumnas"),
script font on every heading, icon-in-circle grids, more than two dark sections
in a row, long letter-spaced uppercase paragraphs.

## Decisions for Elena

- **D1 Hero crop.** Desktop shows the full group on the right; phones show the
  group as a band above the headline. Is the group small enough on phones, or
  should we use a tighter photo for mobile?
- **D2 Adult class photo.** The studio photo at the barre now illustrates
  "Ballet para adultos". Is that an adult group?
- **D3 Headline typeface.** Keep Montserrat uppercase, or try a light serif for
  the main headline only?
- **D4 Productions.** Which production does each stage photo belong to?

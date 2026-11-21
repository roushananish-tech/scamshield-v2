# ScamShield design brief

- Design read: people in India who are scared, rushed or not confident with phones, often during a scam call or minutes after losing money. Register: calm, plain, official.
- Concept spine: a calm officer at a desk with a printed checklist. Plain paper, one ink colour, signal colours only where they carry meaning, always paired with words.
- Delivery tier: editorial (micro-motion only).
- Animation mode: non-animated — user picked Non-animated: "People open this during a scam call or right after losing money. A scroll film delays the one action they need."
- Locked palette: ink #0F1B2D, ink-2 #475467, paper #FFFFFF, surface #F2F4F7, line #667085, action #123A8C, danger #B42318 / #FEF3F2, caution #B54708 / #FFFAEB / #93370D, clear #067647 / #ECFDF3. Light on white; every pair checked against WCAG 2.x. Defence: a government-form calm that reads under stress, with red reserved for "act now".
- Locked type: Atkinson Hyperlegible 400/700 (Braille Institute, distinct I l 1 0 O for OTPs, UTRs and amounts), Noto Sans Devanagari fallback for pasted Hindi, then system-ui.
- Screens: front door, on a call, call card, lost money, plan with summary builder, check, quiz, rules, share, 404. Single 640px column at every viewport.
- Asset plan: hand-drawn shield-and-keyhole mark (inline SVG and favicon), launch cover and OG image. No photos, illustrations, video or 3D in the app: they cost load time on cheap phones and compete with the instructions.
- CTA inventory: three shared button styles only (Primary, Danger, Secondary), by the owner's explicit choice, so a stressed or older person learns once what a button looks like.
- Privacy: nothing typed leaves the device. connect-src 'none', no storage, no analytics, no server functions that take input.

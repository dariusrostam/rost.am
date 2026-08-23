export const SITE = {
  title: 'Darius Rostam',
  description:
    'Dr. Darius Rostam, LL.M. (NYU) — postdoc at the University of Bonn and Executive Director of the Bucerius IP Center. Private law, law and technology, copyright and AI.',
  url: 'https://rost.am',
  author: 'Darius Rostam',
  locale: 'en',
} as const;

export const SOCIALS = {
  linkedin: 'https://www.linkedin.com/in/dariusrostam/',
  ssrn: 'https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=3680881',
  bluesky: 'https://bsky.app/profile/rost.am',
  // TODO(Darius): add if you want it surfaced — not in the brief's socials list,
  // so left out of JSON-LD `sameAs` rather than guessed.
  orcid: '',
  email: '', // TODO(Darius): public contact address for the footer / Impressum
  rss: '/rss.xml',
} as const;

// TODO(Darius): set your real Buttondown username, then switch this on.
// Double opt-in must be enabled in the Buttondown dashboard settings — German
// law (§ 7 Abs. 2 Nr. 3 UWG) requires confirmed opt-in for newsletter signup.
export const BUTTONDOWN_USERNAME = 'TODO-buttondown-username';

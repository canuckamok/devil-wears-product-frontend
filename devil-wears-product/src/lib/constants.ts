// ============================================
// Devil Wears Product — Brand Voice & Config
// ============================================

export const SITE = {
  name: "Devil Wears Product",
  tagline: "Merch for people who manage products, not expectations.",
  description:
    "Satirical product management merch. Tees, hoodies, mugs, and stickers for people who've survived sprint planning and lived to tell the tale.",
  url: "https://devilwearsproduct.shop",
} as const;

export const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "About", href: "/about" },
] as const;

// Collections hidden from nav (redundant with Shop All or internal-only)
export const HIDDEN_COLLECTIONS = ["all"];

// Collections that should appear first in the nav (in this order)
export const COLLECTION_ORDER = ["limited-release", "tees", "sweaters", "mugs", "other"];

export const SATIRE = {
  cart: {
    title: "Sprint Backlog",
    addButton: "Add to Sprint",
    addingButton: "Estimating story points...",
    addedButton: "Shipped!",
    emptyTitle: "Your backlog is empty.",
    emptySubtitle:
      "Your PM would be proud. Actually, no they wouldn't. They'd ask why you're not working on the Q3 OKRs.",
    checkoutButton: "Ship It",
    removeLabel: "Deprioritize",
    itemSingular: "item",
    itemPlural: "items",
  },

  loading: [
    "Aligning stakeholders...",
    "Syncing with the roadmap...",
    "Checking with Legal...",
    "Waiting for sign-off from 7 VPs...",
    "Reticulating splines (and OKRs)...",
    "Generating buy-in...",
    "Deprioritizing your priorities...",
    "Running it by the steering committee...",
    "Calculating story points...",
    "Moving tickets to 'In Review'...",
    "Scheduling the meeting about the meeting...",
    "Updating the JIRA board nobody reads...",
  ],

  notFound: {
    title: "404",
    subtitle: "This page was deprioritized in the last sprint planning.",
    body: "It scored a 2 on the RICE framework and was moved to the ice box, where it will remain until a VP asks about it in 6 months.",
    cta: "Return to the Roadmap",
  },

  error: {
    title: "Something broke.",
    subtitle: "Probably a P0. We've escalated it to the on-call engineer who is currently 'unavailable.'",
    cta: "Try Again (we believe in you)",
  },

  collections: {
    "limited-release": "Limited edition drops. Once they're gone, they're gone — just like your Q3 headcount.",
    tees: "Because nothing says 'I understand the customer' like wearing your dysfunction.",
    sweaters: "For when the office thermostat is as poorly managed as your sprint velocity.",
    mugs: "A vessel for your third coffee and your silent screams during standup.",
    stickers: "Stick them on your laptop. Let your coworkers know you've given up.",
    other: "The stuff that didn't fit neatly into a category. Much like you on the org chart.",
    all: "Every artifact in our catalog of corporate despair. Browse freely — there's no sprint capacity limit here.",
  } as Record<string, string>,

  announcements: [
    "Free existential dread with every order. Terms and OKRs apply.",
    "New drop: merch that pairs well with your imposter syndrome.",
    "Warning: wearing our products may cause unsolicited sprint retrospective conversations.",
    "Now shipping faster than your team ships features.",
  ],

  manifesto: {
    headline: "We believe in the product.",
    subheadline: "Just not the roadmap.",
    body: [
      "Devil Wears Product was born in a sprint retrospective that went 45 minutes over time.",
      "We exist for the PMs who've written PRDs that nobody read, the engineers who've been asked to 'just make it pop,' and the designers who've been told the mockup is 'almost there' for the seventh time.",
      "Our merch doesn't solve your workflow problems. But at least you'll look good in the post-mortem.",
      "We ship product. Literally.",
    ],
  },

  homepage: {
    heroHeadline: "Devil Wears Product",
    heroSubheadline:
      "Merch for the quietly suffering product professional.",
    heroCta: "Browse the Roadmap",
    featuredTitle: "Shipped This Sprint",
    featuredSubtitle: "Somehow these made it past the design review.",
    collectionsTitle: "Browse by Category",
    collectionsSubtitle: "Or as we call it, 'navigating the taxonomy nobody agreed on.'",
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} Devil Wears Product. All rights reserved. None of this is financial advice.`,
    tagline: "Built with existential dread and Next.js.",
  },
} as const;

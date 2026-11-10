// The left menu. Every feature on the Q4 roadmap lives in one of these sections.

export type SectionKey =
  | "brand"
  | "studio"
  | "live-ads"
  | "swipe"
  | "competitors"
  | "approvals"
  | "libraries";

export type Section = {
  key: SectionKey;
  label: string;
  group: "client" | "shared";
  summary: string;
  milestone: "Milestone 1 · Nov 13" | "Milestone 2 · Dec 11";
  plans: string[];
};

export const SECTIONS: Section[] = [
  {
    key: "brand",
    label: "Brand guidelines",
    group: "client",
    summary: "Logo, colors, fonts, imagery style and tone for this client.",
    milestone: "Milestone 1 · Nov 13",
    plans: [
      "Build a brand kit from the client's website when they don't have one",
      "A one-page brand sheet the client approves before any ads get designed",
      "Every ad in the creative studio pulls from the approved kit",
    ],
  },
  {
    key: "studio",
    label: "Creative studio",
    group: "client",
    summary: "Build new concepts and ask for edits in plain words.",
    milestone: "Milestone 1 · Nov 13",
    plans: [
      "Concepts laid out by code from the element and font libraries",
      "Ask for an edit in plain words and get a new version",
      "Export static ads plus animated 4:5 and 9:16 versions",
    ],
  },
  {
    key: "live-ads",
    label: "Live ads",
    group: "client",
    summary: "Every ad running now with its results, plus past winners.",
    milestone: "Milestone 2 · Dec 11",
    plans: [
      "Live Meta and Google ads with their results",
      "Past winners saved as references for new concepts",
    ],
  },
  {
    key: "swipe",
    label: "Swipe file",
    group: "client",
    summary: "Swipe right to save and left to skip through Meta Ad Library ads.",
    milestone: "Milestone 2 · Dec 11",
    plans: [
      "One ad at a time, full screen, with arrow-key controls",
      "Quick tags on every save: hook, layout, angle and why it works",
      "Saved ads become examples for the design training course",
    ],
  },
  {
    key: "competitors",
    label: "Competitor center",
    group: "client",
    summary: "Competitors' ads, how long each has run, and the gap map.",
    milestone: "Milestone 2 · Dec 11",
    plans: [
      "The swipe feed filtered to this client's competitors",
      "Run length on every ad, since 30+ days is a good stand-in for a winner",
      "A gap map of angles competitors overuse and angles nobody uses",
    ],
  },
  {
    key: "approvals",
    label: "Approvals",
    group: "client",
    summary: "The launch page: picked creatives shown as they will appear in each platform.",
    milestone: "Milestone 2 · Dec 11",
    plans: [
      "Previews in Meta feed, Stories/Reels and Google display placements",
      "Static and motion versions side by side",
      "The client approves from one page",
    ],
  },
  {
    key: "libraries",
    label: "Libraries",
    group: "shared",
    summary: "AI-made design elements and licensed fonts, shared by every client's studio.",
    milestone: "Milestone 1 · Nov 13",
    plans: [
      "Element library: textures, backgrounds, props, shapes, icons and light effects as tagged PNGs",
      "AI makes single elements only. Code lays out every ad, and products stay as real cutouts",
      "Font library: fonts licensed for ad use, with tested heading/body pairings tagged by mood",
    ],
  },
];

export function findSection(key: string): Section | undefined {
  return SECTIONS.find((section) => section.key === key);
}

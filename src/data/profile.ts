/** Editorial content for the homepage: work highlights, client words, case study. */

export const vmlHighlights = [
  {
    stat: "Dozens",
    label: "of releases",
    body: "Led regression testing across dozens of releases, with Playwright suites running in GitHub Actions to catch breakages before they shipped.",
  },
  {
    stat: "20",
    label: "parallel workers",
    body: "Engineered a visual regression suite for the US site that runs 20 Playwright instances in parallel.",
  },
  {
    stat: "8×",
    label: "device coverage",
    body: "That visual suite multiplied device coverage eightfold, and I've grown the end-to-end suite release over release.",
  },
];

export interface Testimonial {
  quote: string;
  /** Omitted when the client prefers not to be named. */
  name?: string;
  role: string;
  /** The live site, when there is one. */
  url?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "That was really fast, it looks great!",
    name: "Jeff Conners",
    role: "Artist",
    url: "https://jeffconners.art",
  },
  {
    quote: "This is going to draw so much new business. It's fast and looks awesome!",
    role: "Owner, Tetrad Build",
  },
];

export const swessoCaseStudy = {
  url: "https://swesso.com",
  image: "/projects/swesso-thumb.jpg",
  brief: "I wanted to understand museums, art, and what my own taste says about me.",
  approach:
    "Swesso turns museum collections into a swipe deck, the interaction everyone already knows. Every card teaches you about the piece and the artist, and your likes build a picture of your taste.",
  outcome: "Live at swesso.com, where people have swiped through more than 10,000 artworks.",
  stat: { value: "10,000+", label: "artworks swiped" },
};

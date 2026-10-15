export interface CaseStudy {
  /** What I did on it. */
  role: string;
  brief: string;
  approach: string;
  outcome: string;
  /** A headline number, when there's a real one. */
  stat?: { value: string; label: string };
  /** What makes it different, for projects with a story to tell. */
  differentiators?: { title: string; body: string }[];
  /** Notable engineering decisions. */
  engineering?: string[];
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  /** Public repo. Omitted when the source is private, so "Code" never lands on a profile page. */
  githubUrl?: string;
  liveDemoUrl?: string;
  thumbnail: string;
  previewVideo?: string;
  /** "live" = shipped and publicly reachable at liveDemoUrl. */
  status?: "live" | "in-progress";
  /** Live but still being actively built; shown as "Now building" on the homepage. */
  active?: boolean;
  /** Shown on the homepage and as a full-width card on /projects. */
  featured?: boolean;
  /** Hover glow color for this project's card. */
  accent: string;
  /** Who it was for: a client, my own studio, or myself. */
  kind: "client" | "studio" | "personal";
  /** Shown on /projects/[slug]. */
  caseStudy: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: "tombstone-video",
    kind: "personal",
    caseStudy: {
      role: "Design and full-stack build",
      brief: "Plan an October horror marathon with friends, without the nightly debate over what to watch.",
      approach:
        "A 90s video store you open with friends: rent tapes onto a shared shelf, spread pumpkin votes across your favorites, and let a server-side wheel spin pick each night's feature. The retro look is plain CSS and inline SVG, and TMDB supplies the movies.",
      outcome: "Live at tombstone.video.",
    },
    accent: "#f26b1d",
    featured: true,
    title: "Tombstone Video",
    description:
      "A 90s video store for planning an October horror marathon with friends. Open a store, rent tapes onto a shared shelf, spread your pumpkin votes, and let a server-side wheel spin pick each movie night's feature. Retro look done entirely in plain CSS and inline SVG.",
    techStack: ["Next.js", "TypeScript", "Drizzle ORM", "Neon Postgres", "TMDB API", "Vercel"],
    liveDemoUrl: "https://tombstone.video",
    thumbnail: "/projects/tombstone-video-thumb.jpg",
    status: "live",
  },
  {
    slug: "cartomancer",
    kind: "personal",
    caseStudy: {
      role: "Solo design and build, directing a team of AI coding agents",
      brief:
        "Most D&D tools are either a wiki you fill in by hand or an AI that writes lore for you. I wanted a librarian: something that files what happened at the table, keeps the record straight, and leaves the DM with the final word.",
      approach:
        "Map-first and local-first. Spark, the optional AI, files session notes into a canon ledger and flags contradictions, and everything it suggests waits in one review inbox to keep, edit or undo. I built it solo, directing AI coding agents through written specs, reviews and browser verification.",
      outcome:
        "Live at cartomancer-phi.vercel.app: about 90,000 lines of TypeScript and 750+ commits, with 1,596 automated tests. I use it to run my own campaign.",
      stat: { value: "1,596", label: "automated tests" },
      differentiators: [
        {
          title: "Canon you can trust",
          body: "Every fact records when it's true (timeless, backstory, played in Session 4, or planned) and who may know it, and a permanent changelog shows which sentences Spark wrote and which the DM did.",
        },
        {
          title: "Nothing lands without the DM's say",
          body: "Spark's suggestions arrive marked in one review inbox. Keep, edit or discard them, and undo any batch in one step.",
        },
        {
          title: "Works without AI",
          body: "Every Spark feature has a manual path, so it's a complete campaign manager with no API key at all.",
        },
        {
          title: "Bring your own key, see the cost first",
          body: "AI calls go straight from the browser to the provider, every action shows its estimated price before it runs, and a spend cap stops surprises.",
        },
        {
          title: "The DM owns the data",
          body: "Worlds live on the device, back up to a folder the DM chooses, and can sync through the DM's own server. Export is always open.",
        },
        {
          title: "Built from how DMs actually prep",
          body: "Planning follows Mulligan's toy method and Matt Mercer's scene prep: situations, not scripts, with arcs as seasons and sessions as episodes.",
        },
      ],
      engineering: [
        "Local-first data safety: multi-step writes run in single transactions, and undo uses compare-and-swap so it never overwrites newer edits.",
        "Sync without data loss: last-write-wins with a base-version guard, so a device that has never synced can't overwrite the cloud copy, plus 20 retained snapshots per world.",
        "Provenance: every AI-written sentence is tagged until kept, and a changelog records Spark and DM edits side by side.",
        "AI cost discipline: model tiers matched to each task, prompt caching of the world context, estimates before every call, and untrusted text wrapped before it enters a prompt.",
        "Quality process: 1,596 automated tests, a golden-set evaluation for fact extraction, a coverage ledger of what was last tested and at which commit, and multi-agent reviews including panels of simulated DMs.",
        "Accessibility: a UI-scale setting, no text under 12px, and theme tokens throughout, tested at 140% scale on tablet and phone widths.",
      ],
    },
    accent: "#b8893e",
    featured: true,
    title: "Cartomancer",
    description:
      "A map-first campaign manager for Dungeon Masters, with Spark, an optional AI librarian that files what happened at the table, keeps a ledger of what's true in the world and flags contradictions. The DM always has the final word, and the whole thing works without AI.",
    techStack: ["React", "TypeScript", "Vite", "Leaflet", "Dexie.js", "Zustand", "Supabase", "MCP"],
    liveDemoUrl: "https://cartomancer-phi.vercel.app",
    thumbnail: "/projects/cartomancer-session.jpg",
    status: "live",
    active: true,
  },
  {
    slug: "swesso",
    kind: "personal",
    caseStudy: {
      role: "Full-stack build, LaunchCode capstone",
      brief: "I wanted to understand museums, art, and what my own taste says about me.",
      approach:
        "Swesso turns museum collections into a swipe deck, the interaction everyone already knows. Every card teaches you about the piece and the artist, and your likes build a picture of your taste.",
      outcome: "Live at swesso.com, where people have swiped through more than 10,000 artworks.",
      stat: { value: "10,000+", label: "artworks swiped" },
    },
    accent: "#6d7fd6",
    title: "Swesso",
    description:
      "A Tinder-style artwork matching app that helps users discover art they love. Swipe through curated artwork and build a personalized collection based on your taste. Built as a LaunchCode capstone project.",
    techStack: ["JavaScript", "React", "Spring Boot", "Spring Security", "PostgreSQL", "Redis", "Nginx"],
    liveDemoUrl: "https://swesso.com",
    thumbnail: "/projects/swesso-thumb.jpg",
    previewVideo: "/projects/swesso-preview.mp4",
    status: "live",
  },
  {
    slug: "jeff-conners",
    kind: "client",
    caseStudy: {
      role: "Design and build for a client",
      brief: "Give Kansas City artist Jeff Conners a home for his work online, and a way for collectors and fans to reach him.",
      approach: "A static Astro site on Cloudflare Pages: quick to load, inexpensive to host, and built so the artwork does the talking.",
      outcome: "Live at jeffconners.art.",
    },
    accent: "#e3a33b",
    title: "Jeff Conners Art",
    description:
      "Portfolio website for artist Jeff Conners, showcasing his work and providing a way for collectors and fans to connect.",
    techStack: ["Astro", "JavaScript", "Cloudflare Pages"],
    githubUrl: "https://github.com/JakeBarrettDev/JeffConnersArt",
    liveDemoUrl: "https://jeffconners.art",
    thumbnail: "/projects/jeff-conners-thumb.jpg",
    previewVideo: "/projects/jeff-conners-preview.mp4",
    status: "live",
  },
  {
    slug: "tetrad-build",
    kind: "client",
    caseStudy: {
      role: "Design and build for a client",
      brief: "Give Tetrad Build an online presence and a clear picture of its services.",
      approach: "A Next.js site on Vercel, built to load fast and make the services easy to scan.",
      outcome: "Built for Tetrad's owner.",
    },
    accent: "#c07a5a",
    title: "Tetrad Build",
    description:
      "Business website for Tetrad Build, providing an online presence and information about their services.",
    techStack: ["Next.js", "Vercel"],
    githubUrl: "https://github.com/JakeBarrettDev/tetrad-site",
    thumbnail: "/projects/tetrad-build-thumb.jpg",
    previewVideo: "/projects/tetrad-build-preview.mp4",
  },
  {
    slug: "maroon-raccoon",
    kind: "studio",
    caseStudy: {
      role: "My studio",
      brief: "A home for my LLC, Maroon Raccoon, and the web development and design services it offers.",
      approach: "Next.js on Vercel, the same foundation I use for most client work.",
      outcome: "Live at maroonraccoon.dev.",
    },
    accent: "#a01a2a",
    title: "Maroon Raccoon",
    description:
      "Website for my own development LLC, Maroon Raccoon — offering web development and design services.",
    techStack: ["Next.js", "Vercel"],
    githubUrl: "https://github.com/JakeBarrettDev/MaroonRaccoon",
    liveDemoUrl: "https://maroonraccoon.dev",
    thumbnail: "/projects/maroon-raccoon-thumb.jpg",
    previewVideo: "/projects/maroon-raccoon-preview.mp4",
    status: "live",
  },
];

export interface Project {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  thumbnail: string;
  previewVideo?: string;
  status?: "in-progress";
  /** Shown on the homepage and as a full-width card on /projects. */
  featured?: boolean;
  /** Hover glow color for this project's card. */
  accent: string;
}

export const projects: Project[] = [
  {
    slug: "tombstone-video",
    accent: "#f26b1d",
    featured: true,
    title: "Tombstone Video",
    description:
      "A 90s video store for planning an October horror marathon with friends. Open a store, rent tapes onto a shared shelf, spread your pumpkin votes, and let a server-side wheel spin pick each movie night's feature. Retro look done entirely in plain CSS and inline SVG.",
    techStack: ["Next.js", "TypeScript", "Drizzle ORM", "Neon Postgres", "TMDB API", "Vercel"],
    githubUrl: "https://github.com/JakeBarrettDev",
    liveDemoUrl: "https://tombstone-video.vercel.app",
    thumbnail: "/projects/tombstone-video-thumb.jpg",
  },
  {
    slug: "cartomancer",
    accent: "#b8893e",
    featured: true,
    title: "Cartomancer",
    description:
      "A map-first worldbuilding and campaign manager for Dungeon Masters. Lore, NPCs, quests, and faction clocks all live on the map, and Spark, an optional AI collaborator, helps prep sessions and catch continuity conflicts. Local-first, with everything stored in the browser.",
    techStack: ["React", "TypeScript", "Leaflet", "Zustand", "Dexie.js", "Claude API"],
    githubUrl: "https://github.com/JakeBarrettDev",
    thumbnail: "/projects/cartomancer-thumb.jpg",
    status: "in-progress",
  },
  {
    slug: "swesso",
    accent: "#6d7fd6",
    title: "Swesso",
    description:
      "A Tinder-style artwork matching app that helps users discover art they love. Swipe through curated artwork and build a personalized collection based on your taste. Built as a LaunchCode capstone project.",
    techStack: ["JavaScript", "React", "Spring Boot", "Spring Security", "PostgreSQL", "Redis", "Nginx"],
    githubUrl: "https://github.com/JakeBarrettDev",
    liveDemoUrl: undefined,
    thumbnail: "/projects/swesso-thumb.jpg",
    previewVideo: "/projects/swesso-preview.mp4",
  },
  {
    slug: "jeff-conners",
    accent: "#e3a33b",
    title: "Jeff Conners Art",
    description:
      "Portfolio website for artist Jeff Conners, showcasing his work and providing a way for collectors and fans to connect.",
    techStack: ["Astro", "JavaScript", "Cloudflare Pages"],
    githubUrl: "https://github.com/JakeBarrettDev",
    liveDemoUrl: "https://jeffconners.art",
    thumbnail: "/projects/jeff-conners-thumb.jpg",
    previewVideo: "/projects/jeff-conners-preview.mp4",
  },
  {
    slug: "tetrad-build",
    accent: "#c07a5a",
    title: "Tetrad Build",
    description:
      "Business website for Tetrad Build, providing an online presence and information about their services.",
    techStack: ["Next.js", "Vercel"],
    githubUrl: "https://github.com/JakeBarrettDev",
    liveDemoUrl: "https://tetradbuild.com",
    thumbnail: "/projects/tetrad-build-thumb.jpg",
    previewVideo: "/projects/tetrad-build-preview.mp4",
  },
  {
    slug: "maroon-raccoon",
    accent: "#a01a2a",
    title: "Maroon Raccoon",
    description:
      "Website for my own development LLC, Maroon Raccoon — offering web development and design services.",
    techStack: ["Next.js", "Vercel"],
    githubUrl: "https://github.com/JakeBarrettDev",
    liveDemoUrl: "https://maroonraccoon.dev",
    thumbnail: "/projects/maroon-raccoon-thumb.jpg",
    previewVideo: "/projects/maroon-raccoon-preview.mp4",
  },
];

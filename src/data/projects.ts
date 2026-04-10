export interface Project {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveDemoUrl?: string;
  thumbnail: string;
  previewVideo?: string;
}

export const projects: Project[] = [
  {
    slug: "swesso",
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

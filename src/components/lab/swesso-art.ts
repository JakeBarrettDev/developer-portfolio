/**
 * Public-domain works from The Metropolitan Museum of Art's Open Access
 * collection (CC0), resized to WebP in public/lab/art/. Metadata and credit
 * lines come from the Met's collection API.
 */
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  /** Sortable year for "Sort by year". */
  year: number;
  medium: string;
  credit: string;
  metUrl: string;
  image: string;
  /**
   * Alt text. Deliberately missing on one work: a bug for visitors to find,
   * since it breaks getByAltText and screen readers alike.
   */
  alt?: string;
}

const art = (a: Omit<Artwork, "image" | "alt"> & { alt?: string | null }): Artwork => ({
  ...a,
  image: `/lab/art/${a.id}.webp`,
  alt: a.alt === null ? undefined : (a.alt ?? `${a.title} by ${a.artist}`),
});

export const ARTWORKS: Artwork[] = [
  art({
    id: "wheat-field-with-cypresses",
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    date: "1889",
    year: 1889,
    medium: "Oil on canvas",
    credit: "Purchase, The Annenberg Foundation Gift, 1993",
    metUrl: "https://www.metmuseum.org/art/collection/search/436535",
  }),
  art({
    id: "irises",
    title: "Irises",
    artist: "Vincent van Gogh",
    date: "1890",
    year: 1890,
    medium: "Oil on canvas",
    credit: "Gift of Adele R. Levy, 1958",
    metUrl: "https://www.metmuseum.org/art/collection/search/436528",
  }),
  art({
    id: "great-wave",
    title: "The Great Wave",
    artist: "Katsushika Hokusai",
    date: "ca. 1830–32",
    year: 1831,
    medium: "Woodblock print; ink and color on paper",
    credit: "H. O. Havemeyer Collection, Bequest of Mrs. H. O. Havemeyer, 1929",
    metUrl: "https://www.metmuseum.org/art/collection/search/45434",
  }),
  art({
    id: "the-harvesters",
    title: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    date: "1565",
    year: 1565,
    medium: "Oil on oak",
    credit: "Rogers Fund, 1919",
    metUrl: "https://www.metmuseum.org/art/collection/search/435809",
    alt: null,
  }),
  art({
    id: "madame-x",
    title: "Madame X",
    artist: "John Singer Sargent",
    date: "1883–84",
    year: 1883,
    medium: "Oil on canvas",
    credit: "Arthur Hoppock Hearn Fund, 1916",
    metUrl: "https://www.metmuseum.org/art/collection/search/12127",
  }),
  art({
    id: "the-dance-class",
    title: "The Dance Class",
    artist: "Edgar Degas",
    date: "1874",
    year: 1874,
    medium: "Oil on canvas",
    credit: "Bequest of Mrs. Harry Payne Bingham, 1986",
    metUrl: "https://www.metmuseum.org/art/collection/search/438817",
  }),
  art({
    id: "the-gulf-stream",
    title: "The Gulf Stream",
    artist: "Winslow Homer",
    date: "1899; reworked by 1906",
    year: 1899,
    medium: "Oil on canvas",
    credit: "Catharine Lorillard Wolfe Collection, Wolfe Fund, 1906",
    metUrl: "https://www.metmuseum.org/art/collection/search/11122",
  }),
  art({
    id: "self-portrait-straw-hat",
    title: "Self-Portrait with a Straw Hat",
    artist: "Vincent van Gogh",
    date: "1887",
    year: 1887,
    medium: "Oil on canvas",
    credit: "Bequest of Miss Adelaide Milton de Groot (1876–1967), 1967",
    metUrl: "https://www.metmuseum.org/art/collection/search/436532",
  }),
  art({
    id: "death-of-socrates",
    title: "The Death of Socrates",
    artist: "Jacques Louis David",
    date: "1787",
    year: 1787,
    medium: "Oil on canvas",
    credit: "Catharine Lorillard Wolfe Collection, Wolfe Fund, 1931",
    metUrl: "https://www.metmuseum.org/art/collection/search/436105",
  }),
  art({
    id: "young-woman-water-pitcher",
    title: "Young Woman with a Water Pitcher",
    artist: "Johannes Vermeer",
    date: "ca. 1662",
    year: 1662,
    medium: "Oil on canvas",
    credit: "Marquand Collection, Gift of Henry G. Marquand, 1889",
    metUrl: "https://www.metmuseum.org/art/collection/search/437881",
  }),
];

export const LOGIN_BACKDROP = ARTWORKS[1];

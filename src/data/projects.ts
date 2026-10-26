// The project index shared by Home and the Work archive.
export interface Project {
  name: string;
  location: string;
  src: string;
  slug: string;
  role: string;
  id: string;
}

export const PROJECTS: Project[] = [
  {
    name: "Native Instruments",
    location: "Berlin / 2023",
    src: "/images/project-1.jpg",
    slug: "native-instruments",
    role: "Lead Agency",
    id: "01",
  },
  {
    name: "Oura",
    location: "Oulu / 2023",
    src: "/images/project-2.jpg",
    slug: "oura",
    role: "Digital Partner",
    id: "02",
  },
  {
    name: "Hender Scheme",
    location: "Tokyo / 2023",
    src: "/images/project-3.jpg",
    slug: "hender-scheme",
    role: "Creative Direction",
    id: "03",
  },
  {
    name: "B&O Play",
    location: "Struer / 2022",
    src: "/images/project-4.jpg",
    slug: "bo-play",
    role: "Interactive Design",
    id: "04",
  },
  {
    name: "Nothing",
    location: "London / 2022",
    src: "/images/project-5.jpg",
    slug: "nothing",
    role: "Technical Partner",
    id: "05",
  },
  {
    name: "Gentle Monster",
    location: "Seoul / 2022",
    src: "/images/project-6.jpg",
    slug: "gentle-monster",
    role: "Lead Agency",
    id: "06",
  },
  {
    name: "Puma POV",
    location: "Global / 2021",
    src: "/images/project-7.jpg",
    slug: "puma-pov",
    role: "Creative Design",
    id: "07",
  },
  {
    name: "Jaarvis Noir",
    location: "Paris / 2021",
    src: "/images/project-8.jpg",
    slug: "jaarvis",
    role: "Event",
    id: "08",
  },
  // Added with their project pages; thumbnails are each page's first gallery
  // image, since their hero images already appear in this grid.
  {
    name: "DPSC x Puma",
    location: "Global / 2022",
    src: "/images/project-9.jpg",
    slug: "dpsc-puma",
    role: "Creative Concept",
    id: "09",
  },
  {
    name: "Grid 7 Years",
    location: "Berlin / 2022",
    src: "/images/project-12.jpg",
    slug: "grid-7-years",
    role: "Art Direction",
    id: "10",
  },
  {
    name: "Music Battle",
    location: "Global / 2021",
    src: "/images/project-11.jpg",
    slug: "puma-music",
    role: "Direction",
    id: "11",
  },
];

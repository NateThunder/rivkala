import type { StaticImageData } from "next/image";
import pressPhoto2 from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-2.jpg";
import pressPhoto3 from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-3.jpg";
import pressPhoto4 from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-4.jpg";
import pressPhoto5 from "../../public/IMAGES OF ME/Rivkala-creditMarianaPires-5.jpg";

export type PressPhoto = {
  src: StaticImageData;
  alt: string;
  label: string;
  credit: string;
  downloadName: string;
};

export const epk = {
  pronunciation: "RIV-kuh-luh",
  pronouns: "she / her",
  strapline: "Showgirl, singer and storyteller",
  shortBio:
    "Rivkala is an award-winning multidisciplinary jazz and soul artist, vocalist, writer and bandleader. From the campy cabaret world of Crushed Velvet, she and her six-piece band blend jazz, soul, funk and klezmer into provocatively playful songs about gender, wealth inequality and mental health. Serious grooves meet theatrical wit beneath the warm glow of her beloved lamp, Lucille.",
  longBio: [
    "Born in Manchester and based in Newcastle, Rivkala builds vivid, theatrical worlds around soulful melodies, sharp observational writing and a larger-than-life cabaret presence. Her work turns everyday frustrations into playful social commentary without losing sight of the groove.",
    "Alongside her six-piece band, she has appeared at BBC Proms performances, Manchester Jazz Festival, the MOBO fringe festival and the SXSW Roadshow, and has supported Postmodern Jukebox at The Glasshouse International Centre for Music. Her music has received coverage from BBC Radio 3, Jazz FM, Selector Radio and BBC Introducing.",
  ],
  achievements: [
    "Two BBC Proms performances",
    "Best Music Video — Youth Music Awards",
    "BBC Introducing “One to Watch”",
    "MOBO fringe and Manchester Jazz Festival",
    "Support for Postmodern Jukebox at The Glasshouse",
    "Radio coverage across BBC Radio 3, Jazz FM and Selector Radio",
  ],
  quotes: [
    {
      text: "No ordinary jazz musician.",
      source: "BBC Introducing",
    },
    {
      text: "The funkiest cabaret I've ever been invited to.",
      source: "Soweto Kinch, Round Midnight",
    },
    {
      text: "A striking stage presence that harks back to the grand age of cabaret.",
      source: "Press quote",
    },
  ],
  music: {
    title: "Crushed Velvet",
    eyebrow: "Featured release",
    href: "https://rivkala.bandcamp.com/album/crushed-velvet",
    cover: "/Album%20covers/Crushed%20Velvet.png",
  },
  video: {
    title: "Chess — official music video",
    id: "LK7PeIOZiVY",
    href: "https://www.youtube.com/watch?v=LK7PeIOZiVY",
    thumbnail: "https://i.ytimg.com/vi/LK7PeIOZiVY/maxresdefault.jpg",
  },
  contactEmail: "rivkala.music@gmail.com",
  pdfHref: "/RIVKALA%20EPK%20OFFICIAL.pdf",
} as const;

export const pressPhotos: readonly PressPhoto[] = [
  {
    src: pressPhoto2,
    alt: "Rivkala seated in a tailored black suit against a pale studio background",
    label: "Press portrait 01",
    credit: "Photo: Mariana Pires",
    downloadName: "rivkala-press-photo-01-mariana-pires.jpg",
  },
  {
    src: pressPhoto3,
    alt: "Close portrait of Rivkala wearing a black suit and patterned tie",
    label: "Press portrait 02",
    credit: "Photo: Mariana Pires",
    downloadName: "rivkala-press-photo-02-mariana-pires.jpg",
  },
  {
    src: pressPhoto4,
    alt: "Rivkala applying lipstick in a wide editorial portrait",
    label: "Editorial landscape",
    credit: "Photo: Mariana Pires",
    downloadName: "rivkala-editorial-landscape-mariana-pires.jpg",
  },
  {
    src: pressPhoto5,
    alt: "Rivkala looking down while adjusting a patterned tie",
    label: "Editorial portrait",
    credit: "Photo: Mariana Pires",
    downloadName: "rivkala-editorial-portrait-mariana-pires.jpg",
  },
];

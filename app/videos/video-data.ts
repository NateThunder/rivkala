export type VideoItem = {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  scrapVariant: "orange-paper" | "burgundy-velvet" | "newspaper-olive";
};

export const videos = [
  // Replace the YouTube ID, URL, title, and thumbnail URL here when videos change.
  {
    id: "cVnYnMeSUhw",
    title: "Rivkala - All I Should Expect (Official Video)",
    youtubeUrl: "https://www.youtube.com/watch?v=cVnYnMeSUhw",
    thumbnailUrl: "https://i.ytimg.com/vi/cVnYnMeSUhw/maxresdefault.jpg",
    scrapVariant: "orange-paper",
  },
  {
    id: "LK7PeIOZiVY",
    title: "Rivkala - Chess (Official Video)",
    youtubeUrl: "https://www.youtube.com/watch?v=LK7PeIOZiVY",
    thumbnailUrl: "https://i.ytimg.com/vi/LK7PeIOZiVY/maxresdefault.jpg",
    scrapVariant: "burgundy-velvet",
  },
  {
    id: "TnpmmD1SJCY",
    title: "Rivkala - Vultures (Official Video)",
    youtubeUrl: "https://www.youtube.com/watch?v=TnpmmD1SJCY",
    thumbnailUrl: "https://i.ytimg.com/vi/TnpmmD1SJCY/maxresdefault.jpg",
    scrapVariant: "newspaper-olive",
  },
] satisfies readonly VideoItem[];

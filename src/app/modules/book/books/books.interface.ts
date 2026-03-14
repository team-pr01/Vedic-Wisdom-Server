export type TLevel = {
  name: string; 
};

export type TBooks = {
  imageUrl?: string;
  name: string;
  type: "veda" | "purana" | "upanishad";
  structure: "Chapter-Verse" | "Mandala-Sukta-Rik" | "Kanda-Sarga-Shloka" | "Custom";
  levels: TLevel[];
};

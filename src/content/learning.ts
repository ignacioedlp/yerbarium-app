import content from "./editorial.json";

export type EditorialArticle = {
  title: string;
  introduction: string;
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    styleGuides?: { slug: string; name: string; description: string }[];
    notes?: string[];
    steps?: { title: string; copy: string }[];
    materials?: { title: string; copy: string }[];
  }[];
  sources: { name: string; publisher: string; href: string; note: string }[];
};
export const articles: Record<string, EditorialArticle | undefined> = content;
export const learningLinks = [
  { article: "cultura", label: "Cultura matera" },
  { article: "sobre-la-yerba", label: "Sobre la yerba" },
  { article: "como-preparar-un-mate", label: "Cómo preparar un mate" },
  { article: "como-curar-un-mate", label: "Cómo curar un mate" },
] as const;

export type NewsPublic = {
  id: string;
  title: string;
  description: string;
  published_at: string;
  created_at: string | null;
};

export type NewsListPublic = {
  data: NewsPublic[];
  count: number;
};

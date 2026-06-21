export type CategoryPublic = {
  id: string;
  name: string;
  created_at: string | null;
};

export type CategoryCreate = {
  name: string;
};

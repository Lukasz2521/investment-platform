export type UserDocumentType =
  | 'id_front'
  | 'id_back'
  | 'address_proof'
  | 'iban'
  | 'funds_source';

export type AdminUserDocumentPublic = {
  document_type: UserDocumentType | string;
  filename: string;
  content_type: string;
  created_at: string | null;
};

export type AdminUserDocumentsPublic = {
  data: AdminUserDocumentPublic[];
};

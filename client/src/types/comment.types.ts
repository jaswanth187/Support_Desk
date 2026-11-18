export interface Comment {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: "ADMIN" | "AGENT" | "CUSTOMER";
  };
}

export interface CreateCommentPayload {
  message: string;
}
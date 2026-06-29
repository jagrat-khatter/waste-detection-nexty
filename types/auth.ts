// Responsibility: Define minimal frontend auth-only shared types decoupled from business models.
export type User = {
  uid: string;
  email: string | null;
};

export type Session = {
  uid: string;
  email: string | null;
};

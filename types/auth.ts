// Responsibility: Define minimal frontend auth-only shared types decoupled from business models.
export type User = {
  id: string;
  email: string;
  role: "ADMIN" | "COLLECTOR";
  name: string | null;
};

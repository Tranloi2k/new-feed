import { User } from "./user";

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: Omit<User, "email">;
}

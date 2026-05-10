import { defineStore } from "pinia";
import { api } from "../api";

type User = {
  _id: string;
  email: string;
  name: string;
  settings: { payDay: number };
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    loading: false
  }),
  actions: {
    loginWithGoogle() {
      window.location.href = `${import.meta.env.VITE_API_URL ?? "http://localhost:4000"}/auth/google`;
    },
    async fetchMe() {
      this.loading = true;
      try {
        const { data } = await api.get<User>("/api/me");
        this.user = data;
      } catch {
        this.user = null;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      await api.post("/auth/logout");
      this.user = null;
      window.location.href = "/login";
    }
  }
});

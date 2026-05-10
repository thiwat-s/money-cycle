import { defineStore } from "pinia";
import { api } from "../api";

export type Category = {
  _id: string;
  name: string;
  color: string;
  order: number;
};

export const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [] as Category[],
    loading: false
  }),
  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const { data } = await api.get<Category[]>("/api/categories");
        this.categories = data;
      } finally {
        this.loading = false;
      }
    },
    async createCategory(payload: Pick<Category, "name" | "color" | "order">) {
      const { data } = await api.post<Category>("/api/categories", payload);
      this.categories.push(data);
      this.categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    },
    async updateCategory(id: string, payload: Pick<Category, "name" | "color" | "order">) {
      const { data } = await api.put<Category>(`/api/categories/${id}`, payload);
      this.categories = this.categories
        .map((category) => (category._id === id ? data : category))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    },
    async deleteCategory(id: string) {
      await api.delete(`/api/categories/${id}`);
      this.categories = this.categories.filter((category) => category._id !== id);
    }
  }
});

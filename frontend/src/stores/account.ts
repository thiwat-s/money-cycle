import { defineStore } from "pinia";
import { api } from "../api";

export type Account = {
  _id: string;
  name: string;
  color: string;
  startingBalance: number;
  order: number;
};

export type AccountPayload = Pick<Account, "name" | "color" | "startingBalance" | "order">;

export const useAccountStore = defineStore("account", {
  state: () => ({
    accounts: [] as Account[],
    loading: false
  }),
  actions: {
    async fetchAccounts() {
      this.loading = true;
      try {
        const { data } = await api.get<Account[]>("/api/accounts");
        this.accounts = data;
      } finally {
        this.loading = false;
      }
    },
    async createAccount(payload: AccountPayload) {
      const { data } = await api.post<Account>("/api/accounts", payload);
      this.accounts.push(data);
      this.accounts.sort((a, b) => a.order - b.order);
    },
    async updateAccount(id: string, payload: AccountPayload) {
      const { data } = await api.put<Account>(`/api/accounts/${id}`, payload);
      this.accounts = this.accounts.map((account) => (account._id === id ? data : account)).sort((a, b) => a.order - b.order);
    },
    async deleteAccount(id: string) {
      await api.delete(`/api/accounts/${id}`);
      this.accounts = this.accounts.filter((account) => account._id !== id);
    }
  }
});

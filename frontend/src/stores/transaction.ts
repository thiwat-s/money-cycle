import { defineStore } from "pinia";
import { api } from "../api";

export type Transaction = {
  _id: string;
  cycleId: string;
  accountId: string;
  type: "expense" | "transfer" | "income";
  amount: number;
  category: string;
  note: string;
  date: string;
  transferToAccountId?: string;
};

export const useTransactionStore = defineStore("transaction", {
  state: () => ({
    transactions: [] as Transaction[],
    loading: false
  }),
  actions: {
    async fetchTransactions(cycleId?: string) {
      this.loading = true;
      try {
        const { data } = await api.get<Transaction[]>("/api/transactions", { params: { cycleId } });
        this.transactions = data;
      } finally {
        this.loading = false;
      }
    },
    async createTransaction(payload: Omit<Transaction, "_id">) {
      const { data } = await api.post<Transaction>("/api/transactions", payload);
      this.transactions.unshift(data);
    },
    async updateTransaction(id: string, payload: Omit<Transaction, "_id">) {
      const { data } = await api.put<Transaction>(`/api/transactions/${id}`, payload);
      this.transactions = this.transactions.map((transaction) => (transaction._id === id ? data : transaction));
    },
    async deleteTransaction(id: string) {
      await api.delete(`/api/transactions/${id}`);
      this.transactions = this.transactions.filter((transaction) => transaction._id !== id);
    }
  }
});

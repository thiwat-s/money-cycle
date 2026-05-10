import { defineStore } from "pinia";
import { api } from "../api";

export type Allocation = {
  accountId: string;
  amount: number;
};

export type Cycle = {
  _id?: string;
  startDate: string;
  endDate: string;
  salary: number;
  allocations: Allocation[];
};

export const useCycleStore = defineStore("cycle", {
  state: () => ({
    current: null as Cycle | null,
    cycles: [] as Cycle[],
    loading: false
  }),
  actions: {
    async fetchCurrent() {
      const { data } = await api.get<Cycle>("/api/cycles/current");
      this.current = data;
    },
    async fetchHistory() {
      this.loading = true;
      try {
        const { data } = await api.get<Cycle[]>("/api/cycles");
        this.cycles = data;
      } finally {
        this.loading = false;
      }
    },
    async createCycle(payload: { salary: number; allocations?: Allocation[] }) {
      const { data } = await api.post<Cycle>("/api/cycles", payload);
      this.current = data;
    },
    async updateAllocations(cycleId: string, allocations: Allocation[]) {
      const { data } = await api.put<Cycle>(`/api/cycles/${cycleId}/allocations`, { allocations });
      this.current = data;
    }
  }
});

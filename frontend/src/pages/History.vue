<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="text-h4 mb-1">History</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">Past cycle statistics</p>
      </div>
    </div>

    <v-card elevation="0">
      <v-table class="responsive-table">
        <thead>
          <tr>
            <th>Cycle</th>
            <th class="text-right">Salary</th>
            <th class="text-right">Allocated</th>
            <th class="text-right">Income</th>
            <th class="text-right">Spent</th>
            <th class="text-right">Remaining</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in summaries" :key="item.id">
            <td data-label="Cycle">{{ item.range }}</td>
            <td data-label="Salary" class="text-right">{{ money(item.salary) }}</td>
            <td data-label="Allocated" class="text-right">{{ money(item.allocated) }}</td>
            <td data-label="Income" class="text-right">{{ money(item.income) }}</td>
            <td data-label="Spent" class="text-right">{{ money(item.spent) }}</td>
            <td data-label="Remaining" class="text-right">{{ money(item.remaining) }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api } from "../api";
import { useCycleStore, type Cycle } from "../stores/cycle";
import type { Transaction } from "../stores/transaction";

const cycle = useCycleStore();
const totalsByCycle = ref<Record<string, { income: number; spent: number }>>({});

const summaries = computed(() =>
  cycle.cycles.map((item) => {
    const allocated = item.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const totals = totalsByCycle.value[item._id ?? ""] ?? { income: 0, spent: 0 };
    return {
      id: item._id ?? `${item.startDate}-${item.endDate}`,
      range: `${dateLabel(item.startDate)} to ${dateLabel(item.endDate)}`,
      salary: item.salary,
      allocated,
      income: totals.income,
      spent: totals.spent,
      remaining: allocated + totals.income - totals.spent
    };
  })
);

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", currencyDisplay: "code" }).format(value);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

async function loadCycleTotals(cycles: Cycle[]) {
  const entries = await Promise.all(
    cycles
      .filter((item) => item._id)
      .map(async (item) => {
        const { data } = await api.get<Transaction[]>("/api/transactions", { params: { cycleId: item._id } });
        const spent = data.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + transaction.amount, 0);
        const income = data.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + transaction.amount, 0);
        return [item._id as string, { income, spent }] as const;
      })
  );
  totalsByCycle.value = Object.fromEntries(entries);
}

onMounted(async () => {
  await cycle.fetchHistory();
  await loadCycleTotals(cycle.cycles);
});
</script>

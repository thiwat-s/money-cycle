<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="text-h4 mb-1">Dashboard</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">{{ rangeLabel }}</p>
      </div>
      <div class="header-actions">
        <v-btn variant="tonal" prepend-icon="mdi-bank-plus" @click="openAccountDialog()">New Account</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCycleDialog">Start Cycle</v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="3">
        <v-card class="metric pa-5" elevation="0">
          <div class="text-body-2 text-medium-emphasis">Total Remaining</div>
          <div class="text-h5 mt-2">{{ money(totalRemaining) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="metric pa-5" elevation="0">
          <div class="text-body-2 text-medium-emphasis">Spent This Cycle</div>
          <div class="text-h5 mt-2">{{ money(totalExpenses) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="metric pa-5" elevation="0">
          <div class="text-body-2 text-medium-emphasis">Allocated</div>
          <div class="text-h5 mt-2">{{ money(totalAllocated) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="metric pa-5" elevation="0">
          <div class="text-body-2 text-medium-emphasis">Days Left</div>
          <div class="text-h5 mt-2">{{ daysLeft }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-6" elevation="0">
      <v-card-title class="responsive-card-title">
        <span>Daily Summary</span>
        <div class="daily-filter">
          <DateField v-model="dailyFilter.date" label="View Date" />
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="metric pa-5" elevation="0">
              <div class="text-body-2 text-medium-emphasis">Total Remaining as of {{ dailyFilter.date }}</div>
              <div class="text-h5 mt-2">{{ money(selectedRemaining) }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="metric pa-5" elevation="0">
              <div class="text-body-2 text-medium-emphasis">Total Expenses on {{ dailyFilter.date }}</div>
              <div class="text-h5 mt-2">{{ money(selectedDayExpenses) }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-table class="responsive-table mt-4">
          <thead>
            <tr>
              <th>Account</th>
              <th class="text-right">Daily Expenses</th>
              <th class="text-right">Remaining as of Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in accounts.accounts" :key="account._id">
              <td data-label="Account">{{ account.name }}</td>
              <td data-label="Daily Expenses" class="text-right">{{ money(dailyExpenseFor(account._id)) }}</td>
              <td data-label="Remaining" class="text-right">{{ money(balanceForDate(account._id, dailyFilter.date)) }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <v-card class="mt-6" elevation="0">
      <v-card-title class="responsive-card-title">
        <span>Accounts</span>
        <v-btn v-if="cycle.current?._id" size="small" variant="tonal" prepend-icon="mdi-cash-multiple" @click="openAllocationDialog">
          Edit Allocations
        </v-btn>
      </v-card-title>
      <v-table class="responsive-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Color</th>
            <th class="text-right">Allocation</th>
            <th class="text-right">Expenses</th>
            <th class="text-right">Remaining</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts.accounts" :key="account._id">
            <td data-label="Account">{{ account.name }}</td>
            <td data-label="Color"><v-chip :color="account.color" variant="flat" size="small">{{ account.color }}</v-chip></td>
            <td data-label="Allocation" class="text-right">{{ money(allocationFor(account._id)) }}</td>
            <td data-label="Expenses" class="text-right">{{ money(expenseFor(account._id)) }}</td>
            <td data-label="Remaining" class="text-right">{{ money(balanceFor(account._id)) }}</td>
            <td data-label="Actions" class="text-right table-actions">
              <v-btn icon="mdi-pencil" variant="text" density="comfortable" @click="openAccountDialog(account)" />
              <v-btn icon="mdi-delete" variant="text" density="comfortable" color="error" @click="deleteAccount(account._id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="cycleDialog" max-width="460" :fullscreen="mobile">
      <v-card title="Start New Cycle">
        <v-card-text>
          <v-text-field v-model.number="cycleForm.salary" label="Salary received" type="number" min="0" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveCycle">Save</v-btn>
          <v-btn variant="text" @click="cycleDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="accountDialog" max-width="520" :fullscreen="mobile">
      <v-card :title="accountForm.id ? 'Edit Account' : 'New Account'">
        <v-card-text class="form-grid">
          <v-text-field v-model="accountForm.name" label="Account name" />
          <v-text-field v-model="accountForm.color" label="Color" type="color" />
          <v-text-field v-model.number="accountForm.order" label="Display order" type="number" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveAccount">Save</v-btn>
          <v-btn variant="text" @click="accountDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="allocationDialog" max-width="620" :fullscreen="mobile">
      <v-card title="Edit Allocations">
        <v-card-text class="form-grid">
          <div class="text-body-2 text-medium-emphasis">Total must not exceed {{ money(cycle.current?.salary ?? 0) }}.</div>
          <div v-for="allocation in allocationForm" :key="allocation.accountId" class="allocation-row">
            <span>{{ accountName(allocation.accountId) }}</span>
            <v-text-field v-model.number="allocation.amount" label="Amount" type="number" min="0" density="compact" hide-details />
          </div>
          <v-alert v-if="allocationError" type="error" variant="tonal">{{ allocationError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveAllocations">Save</v-btn>
          <v-btn variant="text" @click="allocationDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useDisplay } from "vuetify";
import DateField from "../components/DateField.vue";
import { useAccountStore, type Account } from "../stores/account";
import { useCycleStore, type Allocation } from "../stores/cycle";
import { useTransactionStore } from "../stores/transaction";

const accounts = useAccountStore();
const cycle = useCycleStore();
const transactions = useTransactionStore();
const { mobile } = useDisplay();

const cycleDialog = ref(false);
const accountDialog = ref(false);
const allocationDialog = ref(false);
const allocationError = ref("");
const cycleForm = reactive({ salary: 0 });
const accountForm = reactive({ id: "", name: "", color: "#2563EB", order: 0 });
const allocationForm = ref<Allocation[]>([]);
const dailyFilter = reactive({
  date: formatLocalDate(new Date())
});

const expenses = computed(() => transactions.transactions.filter((item) => item.type === "expense"));
const totalAllocated = computed(() => cycle.current?.allocations.reduce((sum, item) => sum + item.amount, 0) ?? 0);
const totalExpenses = computed(() => expenses.value.reduce((sum, item) => sum + item.amount, 0));
const totalRemaining = computed(() => totalAllocated.value - totalExpenses.value);
const daysLeft = computed(() => {
  if (!cycle.current) return 0;
  const today = startOfDay(new Date()).getTime();
  const end = startOfDay(new Date(cycle.current.endDate)).getTime();
  return Math.max(0, Math.ceil((end - today) / 86400000) + 1);
});
const rangeLabel = computed(() => {
  if (!cycle.current) return "No active cycle yet";
  return `${dateLabel(cycle.current.startDate)} to ${dateLabel(cycle.current.endDate)}`;
});
const selectedDayExpenses = computed(() =>
  expenses.value.filter((item) => dateKey(item.date) === dailyFilter.date).reduce((sum, item) => sum + item.amount, 0)
);
const selectedCumulativeExpenses = computed(() =>
  expenses.value
    .filter((item) => {
      const transactionDate = dateKey(item.date);
      return isDateInCycle(transactionDate) && transactionDate <= dailyFilter.date;
    })
    .reduce((sum, item) => sum + item.amount, 0)
);
const selectedRemaining = computed(() => totalAllocated.value - selectedCumulativeExpenses.value);

function allocationFor(accountId: string) {
  return cycle.current?.allocations.find((item) => item.accountId === accountId)?.amount ?? 0;
}

function expenseFor(accountId: string) {
  return expenses.value.filter((item) => item.accountId === accountId).reduce((sum, item) => sum + item.amount, 0);
}

function balanceFor(accountId: string) {
  return allocationFor(accountId) - expenseFor(accountId);
}

function dailyExpenseFor(accountId: string) {
  return expenses.value
    .filter((item) => item.accountId === accountId && dateKey(item.date) === dailyFilter.date)
    .reduce((sum, item) => sum + item.amount, 0);
}

function balanceForDate(accountId: string, date: string) {
  const spent = expenses.value
    .filter((item) => item.accountId === accountId && isDateInCycle(dateKey(item.date)) && dateKey(item.date) <= date)
    .reduce((sum, item) => sum + item.amount, 0);
  return allocationFor(accountId) - spent;
}

function accountName(accountId: string) {
  return accounts.accounts.find((account) => account._id === accountId)?.name ?? "Unknown account";
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", currencyDisplay: "code" }).format(value);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKey(value: string) {
  return formatLocalDate(new Date(value));
}

function isDateInCycle(date: string) {
  if (!cycle.current) return false;
  return date >= dateKey(cycle.current.startDate) && date <= dateKey(cycle.current.endDate);
}

function openCycleDialog() {
  cycleForm.salary = cycle.current?.salary ?? 0;
  cycleDialog.value = true;
}

async function saveCycle() {
  if (cycleForm.salary < 0) return;
  await cycle.createCycle({ salary: cycleForm.salary });
  cycleDialog.value = false;
  await refreshTransactions();
}

function openAccountDialog(account?: Account) {
  accountForm.id = account?._id ?? "";
  accountForm.name = account?.name ?? "";
  accountForm.color = account?.color ?? "#2563EB";
  accountForm.order = account?.order ?? accounts.accounts.length;
  accountDialog.value = true;
}

async function saveAccount() {
  if (!accountForm.name.trim()) return;
  const payload = { name: accountForm.name.trim(), color: accountForm.color, order: accountForm.order };
  if (accountForm.id) await accounts.updateAccount(accountForm.id, payload);
  else await accounts.createAccount(payload);
  accountDialog.value = false;
}

async function deleteAccount(id: string) {
  if (window.confirm("Delete this account? Existing transactions will still reference it.")) {
    await accounts.deleteAccount(id);
  }
}

function openAllocationDialog() {
  allocationError.value = "";
  allocationForm.value = accounts.accounts.map((account) => ({
    accountId: account._id,
    amount: allocationFor(account._id)
  }));
  allocationDialog.value = true;
}

async function saveAllocations() {
  if (!cycle.current?._id) return;
  const total = allocationForm.value.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  if (total > cycle.current.salary) {
    allocationError.value = "Total allocations cannot exceed cycle salary.";
    return;
  }
  await cycle.updateAllocations(cycle.current._id, allocationForm.value);
  allocationDialog.value = false;
}

async function refreshTransactions() {
  await transactions.fetchTransactions(cycle.current?._id);
}

onMounted(async () => {
  await Promise.all([accounts.fetchAccounts(), cycle.fetchCurrent()]);
  await refreshTransactions();
});
</script>

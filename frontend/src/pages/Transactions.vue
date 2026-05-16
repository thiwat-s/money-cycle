<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="text-h4 mb-1">Transactions</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">All entries in the current cycle</p>
      </div>
      <div class="header-actions">
        <v-btn variant="tonal" prepend-icon="mdi-tag-multiple" @click="openCategoryDialog()">Manage Categories</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" :disabled="!cycle.current?._id" @click="openDialog()">New Transaction</v-btn>
      </div>
    </div>

    <v-card class="mb-6" elevation="0">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select v-model="filters.accountId" clearable label="Filter by account" :items="accounts.accounts" item-title="name" item-value="_id" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="filters.category" clearable label="Filter by category" :items="categoryOptions" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="filters.type" clearable label="Filter by type" :items="transactionTypes" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="0">
      <v-table class="responsive-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Account</th>
            <th>Category</th>
            <th>Note</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredTransactions" :key="item._id">
            <td data-label="Date">{{ dateLabel(item.date) }}</td>
            <td data-label="Type"><v-chip size="small" :color="typeColor(item.type)" variant="tonal">{{ item.type }}</v-chip></td>
            <td data-label="Account">{{ accountName(item.accountId) }}<span v-if="item.type === 'transfer'"> to {{ accountName(item.transferToAccountId) }}</span></td>
            <td data-label="Category">{{ item.category }}</td>
            <td data-label="Note">{{ item.note }}</td>
            <td data-label="Amount" class="text-right">{{ money(item.amount) }}</td>
            <td data-label="Actions" class="text-right table-actions">
              <v-btn icon="mdi-pencil" variant="text" density="comfortable" @click="openDialog(item)" />
              <v-btn icon="mdi-delete" variant="text" density="comfortable" color="error" @click="deleteTransaction(item._id)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="620" :fullscreen="mobile">
      <v-card :title="form.id ? 'Edit Transaction' : 'New Transaction'">
        <v-card-text class="form-grid">
          <DateField v-model="form.date" label="Date" />
          <v-select v-model="form.accountId" label="Source account" :items="accounts.accounts" item-title="name" item-value="_id" />
          <v-select v-model="form.type" label="Type" :items="transactionTypes" />
          <v-select
            v-if="form.type === 'transfer'"
            v-model="form.transferToAccountId"
            label="Destination account"
            :items="destinationAccounts"
            item-title="name"
            item-value="_id"
          />
          <v-text-field v-model.number="form.amount" label="Amount" type="number" min="0" />
          <v-select v-model="form.category" label="Category" :items="categoryOptions" />
          <v-text-field v-model="form.note" label="Note" />
          <v-alert v-if="formError" type="error" variant="tonal">{{ formError }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="save">Save</v-btn>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="categoryDialog" max-width="720" :fullscreen="mobile">
      <v-card title="Category Master">
        <v-card-text class="form-grid">
          <v-row>
            <v-col cols="12" md="5">
              <v-text-field v-model="categoryForm.name" label="Category name" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="categoryForm.color" label="Color" type="color" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model.number="categoryForm.order" label="Order" type="number" />
            </v-col>
          </v-row>
          <v-alert v-if="categoryError" type="error" variant="tonal">{{ categoryError }}</v-alert>
          <div class="category-master-list">
            <div v-for="category in categoryStore.categories" :key="category._id" class="category-master-row">
              <div class="category-master-name">
                <v-chip :color="category.color" variant="flat" size="small">{{ category.name }}</v-chip>
                <span class="text-body-2 text-medium-emphasis">Order {{ category.order }}</span>
              </div>
              <div class="category-master-actions">
                <v-btn icon="mdi-pencil" variant="text" density="comfortable" @click="openCategoryDialog(category)" />
                <v-btn icon="mdi-delete" variant="text" density="comfortable" color="error" @click="deleteCategory(category._id)" />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveCategory">{{ categoryForm.id ? "Save" : "Add" }}</v-btn>
          <v-btn variant="text" @click="closeCategoryDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useDisplay } from "vuetify";
import DateField from "../components/DateField.vue";
import { useAccountStore } from "../stores/account";
import { useCategoryStore, type Category } from "../stores/category";
import { useCycleStore } from "../stores/cycle";
import { useTransactionStore, type Transaction } from "../stores/transaction";

const accounts = useAccountStore();
const categoryStore = useCategoryStore();
const cycle = useCycleStore();
const transactions = useTransactionStore();
const { mobile } = useDisplay();
const dialog = ref(false);
const categoryDialog = ref(false);
const formError = ref("");
const categoryError = ref("");
const filters = reactive({ accountId: null as string | null, category: null as string | null, type: null as string | null });
const form = reactive({
  id: "",
  accountId: "",
  transferToAccountId: "",
  type: "expense" as "expense" | "transfer" | "income",
  amount: 0,
  category: "",
  note: "",
  date: new Date().toISOString().slice(0, 10)
});
const categoryForm = reactive({
  id: "",
  name: "",
  color: "#64748B",
  order: 0
});

const categoryOptions = computed(() => categoryStore.categories.map((category) => category.name));
const destinationAccounts = computed(() => accounts.accounts.filter((account) => account._id !== form.accountId));
const transactionTypes = ["expense", "transfer", "income"];
const filteredTransactions = computed(() =>
  transactions.transactions.filter((item) => {
    if (filters.accountId && item.accountId !== filters.accountId && item.transferToAccountId !== filters.accountId) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.type && item.type !== filters.type) return false;
    return true;
  })
);

function accountName(accountId?: string) {
  return accounts.accounts.find((account) => account._id === accountId)?.name ?? "Unknown";
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "THB", currencyDisplay: "code" }).format(value);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function typeColor(type: Transaction["type"]) {
  if (type === "expense") return "error";
  if (type === "income") return "success";
  return "secondary";
}

function openDialog(transaction?: Transaction) {
  formError.value = "";
  form.id = transaction?._id ?? "";
  form.accountId = transaction?.accountId ?? accounts.accounts[0]?._id ?? "";
  form.transferToAccountId = transaction?.transferToAccountId ?? "";
  form.type = transaction?.type ?? "expense";
  form.amount = transaction?.amount ?? 0;
  form.category = transaction?.category ?? categoryOptions.value[0] ?? "";
  form.note = transaction?.note ?? "";
  form.date = transaction?.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  dialog.value = true;
}

async function save() {
  if (!cycle.current?._id) return;
  if (!form.accountId || form.amount <= 0) {
    formError.value = "Choose an account and enter an amount greater than zero.";
    return;
  }
  if (form.type === "transfer" && !form.transferToAccountId) {
    formError.value = "Choose a destination account for transfers.";
    return;
  }
  if (form.category && !categoryOptions.value.includes(form.category)) {
    formError.value = "Choose a category from the category master.";
    return;
  }

  const payload = {
    cycleId: cycle.current._id,
    accountId: form.accountId,
    type: form.type,
    amount: form.amount,
    category: form.category,
    note: form.note,
    date: new Date(form.date).toISOString(),
    transferToAccountId: form.type === "transfer" ? form.transferToAccountId : undefined
  };

  if (form.id) await transactions.updateTransaction(form.id, payload);
  else await transactions.createTransaction(payload);
  dialog.value = false;
}

function openCategoryDialog(category?: Category) {
  categoryError.value = "";
  categoryForm.id = category?._id ?? "";
  categoryForm.name = category?.name ?? "";
  categoryForm.color = category?.color ?? "#64748B";
  categoryForm.order = category?.order ?? categoryStore.categories.length;
  categoryDialog.value = true;
}

function closeCategoryDialog() {
  categoryDialog.value = false;
  categoryError.value = "";
}

async function saveCategory() {
  const name = categoryForm.name.trim();
  if (!name) {
    categoryError.value = "Category name is required.";
    return;
  }

  try {
    const payload = { name, color: categoryForm.color, order: categoryForm.order };
    if (categoryForm.id) await categoryStore.updateCategory(categoryForm.id, payload);
    else await categoryStore.createCategory(payload);

    categoryForm.id = "";
    categoryForm.name = "";
    categoryForm.color = "#64748B";
    categoryForm.order = categoryStore.categories.length;
    categoryError.value = "";
  } catch {
    categoryError.value = "Unable to save category. The name may already exist.";
  }
}

async function deleteCategory(id: string) {
  if (window.confirm("Delete this category from the master list? Existing transactions keep their category text.")) {
    await categoryStore.deleteCategory(id);
  }
}

async function deleteTransaction(id: string) {
  if (window.confirm("Delete this transaction?")) await transactions.deleteTransaction(id);
}

onMounted(async () => {
  await Promise.all([accounts.fetchAccounts(), categoryStore.fetchCategories(), cycle.fetchCurrent()]);
  await transactions.fetchTransactions(cycle.current?._id);
});
</script>

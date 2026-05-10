<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :model-value="displayValue"
        :label="label"
        :clearable="clearable"
        readonly
        append-inner-icon="mdi-calendar"
        @click:clear="clear"
      />
    </template>

    <v-date-picker v-model="pickerValue" hide-header show-adjacent-months @update:model-value="selectDate" />
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    clearable?: boolean;
  }>(),
  {
    clearable: false
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const menu = ref(false);
const pickerValue = ref<Date | null>(parseDate(props.modelValue));
const displayValue = computed(() => normalizeDate(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    pickerValue.value = parseDate(value);
  }
);

function clear(event: MouseEvent) {
  event.stopPropagation();
  pickerValue.value = null;
  emit("update:modelValue", "");
}

function selectDate(value: unknown) {
  const formatted = formatDate(value);
  if (!formatted) return;

  emit("update:modelValue", formatted);
  menu.value = false;
}

function normalizeDate(value: string): string {
  return formatDate(parseDate(value));
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatDate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return normalizeStringDate(value);

  const date = Array.isArray(value) ? value[0] : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeStringDate(value: string): string {
  const parsed = parseDate(value);
  return parsed ? formatDate(parsed) : "";
}
</script>

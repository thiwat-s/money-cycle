<template>
  <v-app>
    <v-navigation-drawer v-if="auth.user && !mobile" permanent width="248">
      <div class="pa-5">
        <div class="text-h6">Money Cycle</div>
        <div class="text-body-2 text-medium-emphasis">{{ auth.user.email }}</div>
      </div>
      <v-list nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard" />
        <v-list-item prepend-icon="mdi-swap-horizontal" title="Transactions" to="/transactions" />
        <v-list-item prepend-icon="mdi-history" title="History" to="/history" />
      </v-list>
      <template #append>
        <div class="pa-4">
          <v-btn block variant="tonal" prepend-icon="mdi-logout" @click="auth.logout">Sign out</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar v-if="auth.user && mobile" flat border>
      <v-app-bar-title>Money Cycle</v-app-bar-title>
      <v-btn icon="mdi-logout" variant="text" aria-label="Sign out" @click="auth.logout" />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-bottom-navigation v-if="auth.user && mobile" grow color="primary" mandatory>
      <v-btn to="/dashboard" value="dashboard">
        <v-icon>mdi-view-dashboard</v-icon>
        <span>Home</span>
      </v-btn>
      <v-btn to="/transactions" value="transactions">
        <v-icon>mdi-swap-horizontal</v-icon>
        <span>Entries</span>
      </v-btn>
      <v-btn to="/history" value="history">
        <v-icon>mdi-history</v-icon>
        <span>History</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useDisplay } from "vuetify";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
const { mobile } = useDisplay();

onMounted(() => {
  auth.fetchMe();
});
</script>

<template>
  <div class="login-page">
    <section class="login-panel">
      <div>
        <p class="eyebrow">Salary cycle accounting</p>
        <h1>Money Cycle</h1>
        <p class="copy">Plan each pay cycle independently, allocate money across accounts, and track spending without carrying balances forward.</p>
      </div>
      <v-btn size="large" color="primary" prepend-icon="mdi-google" @click="auth.loginWithGoogle">
        Continue with Google
      </v-btn>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(rgba(15, 23, 42, 0.54), rgba(15, 23, 42, 0.48)),
    url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1800&q=80") center/cover;
}

.login-panel {
  width: min(560px, 100%);
  color: white;
  display: grid;
  gap: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #bfdbfe;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(48px, 9vw, 88px);
  line-height: 0.95;
}

.copy {
  margin: 18px 0 0;
  font-size: 18px;
  max-width: 520px;
}
</style>

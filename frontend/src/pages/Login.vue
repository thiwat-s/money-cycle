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
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(8, 17, 34, 0.78) 0%, rgba(8, 17, 34, 0.62) 44%, rgba(8, 17, 34, 0.22) 100%),
    url("https://images.unsplash.com/photo-1554224154-26032fced8bd?auto=format&fit=crop&w=2200&q=85") center/cover;
}

.login-page::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.18), rgba(37, 99, 235, 0.08));
  pointer-events: none;
}

.login-panel {
  width: min(560px, 100%);
  color: white;
  display: grid;
  gap: 28px;
  position: relative;
  z-index: 1;
  justify-self: start;
  margin-left: clamp(0px, 8vw, 120px);
}

.eyebrow {
  margin: 0 0 8px;
  color: #99f6e4;
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

@media (max-width: 720px) {
  .login-page {
    place-items: end start;
    padding: 28px 20px 44px;
    background:
      linear-gradient(180deg, rgba(8, 17, 34, 0.28) 0%, rgba(8, 17, 34, 0.76) 58%, rgba(8, 17, 34, 0.92) 100%),
      url("https://images.unsplash.com/photo-1554224154-26032fced8bd?auto=format&fit=crop&w=1200&q=85") center/cover;
  }

  .login-panel {
    margin-left: 0;
    gap: 24px;
  }

  .copy {
    font-size: 1rem;
  }
}
</style>

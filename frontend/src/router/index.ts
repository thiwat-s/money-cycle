import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import History from "../pages/History.vue";
import Login from "../pages/Login.vue";
import Transactions from "../pages/Transactions.vue";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: Login },
    { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
    { path: "/transactions", component: Transactions, meta: { requiresAuth: true } },
    { path: "/history", component: History, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", redirect: "/login" }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const isLoginPage = to.path === "/login";
  const token = new URLSearchParams(to.hash.replace(/^#/, "")).get("token");

  if (token) {
    auth.setToken(token);
    await auth.fetchMe();
    return auth.user ? { path: "/dashboard", replace: true } : { path: "/login", replace: true };
  }

  if (!auth.checked || isLoginPage || to.meta.requiresAuth) {
    await auth.fetchMe();
  }

  if (isLoginPage && auth.user) {
    return "/dashboard";
  }

  if (to.meta.requiresAuth && !auth.user) {
    return "/login";
  }

  return true;
});

export default router;

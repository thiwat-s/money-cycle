import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import History from "../pages/History.vue";
import Login from "../pages/Login.vue";
import Transactions from "../pages/Transactions.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: Login },
    { path: "/dashboard", component: Dashboard },
    { path: "/transactions", component: Transactions },
    { path: "/history", component: History }
  ]
});

export default router;

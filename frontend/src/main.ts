import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import App from "./App.vue";
import router from "./router";
import "./styles.css";

const vuetify = createVuetify({
  defaults: {
    VSelect: {
      variant: "outlined"
    },
    VTextField: {
      variant: "outlined"
    }
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#2563EB",
          secondary: "#0F766E",
          accent: "#F59E0B",
          background: "#F8FAFC",
          surface: "#FFFFFF"
        }
      }
    }
  }
});

createApp(App).use(createPinia()).use(router).use(vuetify).mount("#app");

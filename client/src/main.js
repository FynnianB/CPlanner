import Vue from 'vue';
import Vuex from 'vuex'
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    navDrawer: false,
    activePage: 'calendar'
  },
  mutations: {
    setNavDrawer(state, enabled) {
      state.navDrawer = enabled
    },
    setPage(state, page) {
      state.activePage = page
    }
  }
});

new Vue({
  store,
  router,
  vuetify,
  render: (h) => h(App)
}).$mount('#app');

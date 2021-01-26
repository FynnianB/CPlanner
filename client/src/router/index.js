import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

Vue.use(VueRouter);

function loggedInRedirectToDashboard(to, from, next) {
  if (localStorage.token) {
    next({ name: 'home' });
  } else {
    next();
  }
}

function isLoggedIn(to, from, next) {
  if (localStorage.token) {
    next();
  } else {
    next({ name: 'login' });
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: isLoggedIn,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: loggedInRedirectToDashboard,
  },
];

const router = new VueRouter({
  routes,
});

export default router;

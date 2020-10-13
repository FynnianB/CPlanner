import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Signup from '../views/Signup.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Calendar from '../views/Calendar.vue';

Vue.use(VueRouter);

function loggedInRedirectToDashboard(to, from, next) {
  if (localStorage.token) {
    next('/dashboard');
  } else {
    next();
  }
}

function isLoggedIn(to, from, next) {
  if (localStorage.token) {
    next();
  } else {
    next('/login');
  }
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
    beforeEnter: loggedInRedirectToDashboard,
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: loggedInRedirectToDashboard,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    beforeEnter: isLoggedIn,
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar,
    beforeEnter: isLoggedIn,
  },
];

const router = new VueRouter({
  routes,
});

export default router;

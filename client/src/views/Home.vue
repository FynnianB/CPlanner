<template>
  <v-app>
    <v-main>
      <v-btn  v-if="activePage === 'groups'" @click.stop="enableNavDrawer" elevation="2" outlined>toggle NavBar</v-btn>
      <NavBar />
      <Calendar v-if="activePage === 'calendar'"/>
      <Notifications v-if="activePage === 'notifications'"/>
    </v-main>
  </v-app>
</template>

<script>
import Calendar from '@/components/Calendar';
import NavBar from '@/components/NavBar';
import Notifications from '@/components/Notifications';

export default {
  name: 'Home',

  computed: {
    activePage () {
      return this.$store.state.activePage
    },
  },
  components: {
    Calendar,
    NavBar,
    Notifications,
  },
  methods: {
    enableNavDrawer () {
      this.$store.commit('setNavDrawer', true)
    },
  }
};
</script>

<template>
  <v-app>
    <v-main>
      <v-btn  v-if="!calendar" @click.stop="enableNavDrawer" elevation="2" outlined>toggle NavBar</v-btn>
      <NavBar />
      <Calendar v-if="calendar"/>
    </v-main>
  </v-app>
</template>

<script>
import Calendar from '@/components/Calendar';
import NavBar from '@/components/NavBar';

export default {
  name: 'Home',

  computed: {
    calendar () {
      return this.$store.state.activePage === 'calendar'
    },
    activePage () {
      return this.$store.state.activePage
    },
  },
  components: {
    Calendar,
    NavBar,
  },
  methods: {
    enableNavDrawer () {
      this.$store.commit('setNavDrawer', true)
    },
  }
};
</script>

<template>
  <v-app>
    <v-main>
      <!-- <v-btn  v-if="activePage === 'disabled'" @click.stop="enableNavDrawer" elevation="2" outlined>toggle NavBar</v-btn> -->
      <NavBar />
      <Calendar v-if="activePage === 'calendar'"/>
      <Notifications v-if="activePage === 'notifications'"/>
      <Groups v-if="activePage === 'groups'"/>
      <Invites v-if="activePage === 'invites'"/>
      <Disabled v-if="activePage === 'disabled'"/>
    </v-main>
  </v-app>
</template>

<script>
import Calendar from '@/components/Calendar';
import NavBar from '@/components/NavBar';
import Notifications from '@/components/Notifications';
import Groups from '@/components/Groups';
import Invites from '@/components/Invites';
import Disabled from '@/components/Disabled';

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
    Groups,
    Invites,
    Disabled,
  },
  methods: {
    enableNavDrawer () {
      this.$store.commit('setNavDrawer', true)
    },
  }
};
</script>

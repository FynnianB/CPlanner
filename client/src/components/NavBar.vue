<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    temporary
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title">
          {{username}}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{unread}} ungelesene Mitteilungen
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <v-list
      nav
      dense
    >
      <v-list-item-group
        v-model="page"
        active-class="blue--text text--accent-4"
        @change="disable"
        mandatory
      >
        <v-list-item value="calendar">
          <v-list-item-icon>
            <v-icon>mdi-calendar</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Kalender</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item value="disabled">
          <v-list-item-icon>
            <!-- <v-icon>mdi-calendar-remove-outline</v-icon> -->
            <v-icon>mdi-close-circle-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Gesperrte Tage</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item value="groups">
          <v-list-item-icon>
            <v-icon>mdi-account-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Gruppen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item value="invites">
          <v-list-item-icon>
            <v-icon>mdi-email-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Einladungen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item value="notifications">
          <v-list-item-icon>
            <v-icon>mdi-bell-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Mitteilungen</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block outlined @click.stop="logout">
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import jwt from 'jsonwebtoken'

export default {
  data: () => ({
    username: null,
    unread: 0
  }),
  computed: {
    drawer: {
      get(){
        return this.$store.state.navDrawer
      },
      set(newDrawer){
        if (!newDrawer) {
          this.disable()
        } else {
          this.getUnreadNotes()
        }
        return newDrawer
      }
    },
    page: {
      get(){
        return this.$store.state.activePage
      },
      set(newPage){
        this.$store.commit('setPage', newPage)
        this.disable()
        return newPage
      }
    }
  },
  watch: {
    group () {
      this.$store.commit('setNavDrawer', false)
    },
  },
  methods: {
    disable() {
      this.$store.commit('setNavDrawer', false)
    },
    logout() {
      localStorage.removeItem('token')
      this.$store.commit('setNavDrawer', false)
      this.$store.commit('setPage', 'calendar')
      this.$router.push({ name: 'login' })
    },
    getUsername() {
      this.username = jwt.decode(localStorage.token).username;
    },
    getUnreadNotes() {
      fetch(process.env.VUE_APP_API_URL+'api/v1/notifications', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(notes => {
        // Token expired?
        if (notes.message && notes.message === 'Token expired') {
          this.logout();
        }
        let counter = 0
        notes.forEach(note => {
          if(!note.read) {
            counter++
          }
        });
        this.unread = counter
      });
    }
  },
  mounted(){
    this.getUsername()
    this.getUnreadNotes()
  }
}
</script>
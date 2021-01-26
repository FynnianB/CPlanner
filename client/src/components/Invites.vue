<template>
  <v-row class="fill-height main-row ma-0">
    <v-col class="d-flex flex-column pa-0">

      <!-- Menubar -->

      <v-toolbar max-height="64">
        <v-btn fab text color="grey darken-2" @click.stop="enableNavDrawer">
          <v-icon>
            mdi-menu
          </v-icon>
        </v-btn>
        <v-toolbar-title class="ml-4">
          Einladungen
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon size="25" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
      </v-toolbar>

      <v-container fluid>
        <v-row dense>
          <v-card-title class="mx-auto" v-if="invites.length === 0">Es sind keine Einladungen vorhanden</v-card-title>
          <v-col
            v-for="invite in invites"
            :key="invite._id"
            cols="6"
            md="4"
            lg="3"
          >
            <v-card loading elevation="10">
              <template slot="progress">
                <v-progress-linear
                  :color="invite.color"
                  height="8"
                  value="100"
                ></v-progress-linear>
              </template>
              <v-card-title v-html="invite.title"></v-card-title>
              <v-card-subtitle v-if="invite.type && invite.type === 'event'">Einladung zu einem <b>Gruppentermin</b></v-card-subtitle>
              <v-card-subtitle v-if="invite.type && invite.type === 'group'">Gruppeneinladung</v-card-subtitle>
              <v-card-text class="pb-0">
                <v-col v-if="invite.group_title">
                  <v-icon class="mr-1">mdi-account-group</v-icon>
                  <span v-html="invite.group_title"></span>
                </v-col>
                <v-col v-if="invite.from">
                  <v-icon class="mr-1">mdi-calendar</v-icon>
                  <span
                    v-html="invite.from.toLocaleDateString('de-DE', {year: 'numeric', month: 'numeric', day: 'numeric'})">
                  </span>
                  <span v-if="invite.dates.length === 2"
                    v-html="' - '+invite.to.toLocaleDateString('de-DE', {year: 'numeric', month: 'numeric', day: 'numeric'})">
                  </span>
                  <v-icon
                    v-if="invite.timed">
                    mdi-circle-small
                  </v-icon>
                  <span
                    v-if="invite.timed"
                    v-html="invite.from.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})+' Uhr'">
                  </span>
                  <span
                    v-if="invite.timed && invite.from !== invite.to && invite.dates.length === 1"
                    v-html="' - '+invite.to.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})+' Uhr'">
                  </span>
                </v-col>
                <v-col v-if="invite.location">
                  <v-icon class="mr-1">mdi-map-marker-outline</v-icon>
                  <span v-html="invite.location"></span>
                </v-col>
                <v-col v-if="invite.desc">
                  <v-icon class="mr-1">mdi-text-subject</v-icon>
                  <span v-html="invite.desc"></span>
                </v-col>
              </v-card-text>
              <v-divider class="mx-4"></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="success" text @click.stop="answerInvite(invite, true)">
                  Annehmen
                </v-btn>
                <v-btn color="error" text @click.stop="answerInvite(invite, false)">
                  Ablehnen
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar
        v-model="error_sheet.enabled"
        timeout="3000"
      >
        <div :class="'py-3 ' + error_sheet.color + '--text'">
          {{ error_sheet.context }}
        </div>

        <template v-slot:action="{ attrs }">
          <v-btn
            color="blue"
            text
            v-bind="attrs"
            @click="error_sheet.enabled = false"
          >
            Schliessen
          </v-btn>
        </template>
      </v-snackbar>
    </v-col>
  </v-row>
</template>

<script>
import dayjs from 'dayjs'

export default {
  data: () => ({
    invites: [],
    error_sheet: {
      color: 'red',
      enabled: false,
      context: '',
    },
  }),
  mounted(){
    this.getInvites()
  },
  methods: {
    refresh () {
      this.invites = []
      this.getInvites()
    },
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
    },
    answerInvite(invite, accept) {
      if (invite.type === 'group'){
        const content = {
          state: accept ? 'accept' : 'deny'
        }
        fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+invite._id, {
          method: 'PUT',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(content)
        }).then(res => res.json())
        .then(res => {
          switch (res.message) {
            case 'User already in this group':
              this.error_sheet.context = 'Du bist schon in dieser Gruppe'
              this.error_sheet.color = 'error'
              break;
            case 'No Invite':
              this.error_sheet.context = 'Zu dieser Gruppe wurdest du nicht eingeladen'
              this.error_sheet.color = 'error'
              break;
            case 'User inserted into Group. Notifications send':
              this.error_sheet.context = 'Du bist der Gruppe erfolgreich beigetreten'
              this.error_sheet.color = 'success'
              break;
            case 'Invite denied. Notifications send':
              this.error_sheet.context = 'Du hast die Einladung erfolgreich abgelehnt'
              this.error_sheet.color = 'success'
              break;
            default:
              const process = accept ? 'Akzeptieren' : 'Ablehnen'
              this.error_sheet.context = 'Beim '+process+' ist ein Fehler aufgetreten'
              this.error_sheet.color = 'error'
              break;
          }
          this.error_sheet.enabled = true
          this.invites.indexOf(invite) > -1 ? this.invites.splice(this.invites.indexOf(invite), 1) : false
        });
      } else if (invite.type === 'event'){
        fetch(process.env.VUE_APP_API_URL+'api/v1/invites/'+invite._id, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ accept: accept })
        }).then(res => res.json())
        .then(res => {
          switch (res.message) {
            case 'Invite do not exist':
              this.error_sheet.context = 'Es liegt keine Einladung vor'
              this.error_sheet.color = 'error'
              break;
            case 'Invite accepted. Date inserted':
              this.error_sheet.context = 'Du warst die letzte Zusage die fehlte. Der Gruppentermin wurde in deinen Kalender übernommen'
              this.error_sheet.color = 'success'
              break;
            case 'Dates inserted. Notifications failed':
              this.error_sheet.context = 'Du hast die Anfrage angenommen. Es fehlen noch weitere Zusagen...'
              this.error_sheet.color = 'success'
              break;
            case 'Invite accepted':
              this.error_sheet.context = 'Du hast die Anfrage angenommen. Es fehlen noch weitere Zusagen...'
              this.error_sheet.color = 'success'
              break;
            case 'Invite declined. Notifications send':
              this.error_sheet.context = 'Du hast die Anfrage erfolgreich abgelehnt. Ob der Termin bestehen bleibt erfährst du per Mitteilung'
              this.error_sheet.color = 'success'
              break;
            case 'Notifications failed':
              this.error_sheet.context = 'Du hast die Anfrage erfolgreich abgelehnt. Ob der Termin bestehen bleibt erfährst du per Mitteilung'
              this.error_sheet.color = 'success'
              break;
            default:
              const process = accept ? 'Akzeptieren' : 'Ablehnen'
              this.error_sheet.context = 'Beim '+process+' ist ein Fehler aufgetreten'
              this.error_sheet.color = 'error'
              break;
          }
          this.error_sheet.enabled = true
          this.invites.indexOf(invite) > -1 ? this.invites.splice(this.invites.indexOf(invite), 1) : false
        });
      }
    },
    getInvites () {
      fetch(process.env.VUE_APP_API_URL+'api/v1/invites', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(res => {
        const invites = res.map(function(row) {
          if (row.type === 'event') {
            const invite = {
              _id: row._id,
              to: new Date(row.to),
              title: row.title,
              from: new Date(row.from),
              timed: true,
              desc: row.desc,
              location: row.location,
              type: row.type,
              dates: [dayjs(row.from).format('YYYY-MM-DD'), dayjs(row.to).format('YYYY-MM-DD')],
              times: [
                new Date(row.from).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}),
                new Date(row.to).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
              ],
              color: 'primary',
            };
            if (dayjs(row.from).format('YYYY-MM-DD') === dayjs(row.to).format('YYYY-MM-DD')) {
              invite.dates = [dayjs(row.from).format('YYYY-MM-DD')]
            }
            if (invite.from.getHours()===0&&invite.from.getMinutes()===0&&invite.to.getHours()===0&&invite.to.getMinutes()===0) {
              invite.timed = false;
            }
            if (row.group) {
              invite.group = row.group
              invite.group_title = row.group_title
            }
            return invite;
          } else if (row.type === 'group') {
            const invite = {
              _id: row._id,
              title: row.title,
              desc: row.desc,
              color: 'orange',
              type: row.type,
            }
            return invite
          }
        });
        this.invites = invites.reverse();
      });
    },
  },
}
</script>
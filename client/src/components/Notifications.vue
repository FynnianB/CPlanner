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
          Mitteilungen
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon size="25" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
      </v-toolbar>

      <v-row class="fill-height ma-0">
        <v-col class="d-flex flex-column pa-0">
          <v-sheet elevation="2" outlined class="align-self-center mt-16" width="30vw" :max-width="maxWidth">
            <v-toolbar>
              <v-badge color="primary" dot overlap bordered offset-x="3" offset-y="12" v-if="unreadNotes.length > 0">
                <v-toolbar-title>
                    Ungelesene Mitteilungen
                </v-toolbar-title>
              </v-badge>
              <v-toolbar-title v-else>
                  Ungelesene Mitteilungen
              </v-toolbar-title>
            </v-toolbar>

            <v-list max-height="70vh" class="overflow-y-auto" three-line v-if="unreadNotes.length > 0">
              <template v-for="(note, index) in unreadNotes">
                <v-list-item :key="note._id">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn @click.stop="readNote(note, index)" icon class="mr-3">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-list-item-content
                        v-bind="attrs"
                        v-on="on">
                        <v-list-item-title v-html="note.title" class="text-h6 font-weight-regular"></v-list-item-title>
                        <v-list-item-subtitle v-html="note.context" class="text-subtitle-1"></v-list-item-subtitle>
                        <v-list-item-subtitle v-html="note.info" class="text-caption text--disabled text-right"></v-list-item-subtitle>
                        <v-list-item-action v-if="note.type === 'declinedDateInvite'">
                          <v-row>
                            <div class="align-self-center">Bei dem Termin bleiben?</div>
                            <v-btn text icon large color="green lighten-2" class="ml-4" @click.stop="stayOnDate(note, index, true)">
                              <v-icon large>mdi-check</v-icon>
                            </v-btn>
                            <v-btn text icon large color="red lighten-2" class="ml-4" @click.stop="stayOnDate(note, index, false)">
                              <v-icon large>mdi-cancel</v-icon>
                            </v-btn>
                          </v-row>
                        </v-list-item-action>
                      </v-list-item-content>
                    </template>
                    <span v-html="note.context"></span>
                  </v-tooltip>
                </v-list-item>

                <v-divider v-if="index < unreadNotes.length-1" :key="index"></v-divider>
              </template>
            </v-list>
            <v-list-item v-else>
              <v-list-item-content three-line>
                <v-list-item-title class="font-weight-light text-center py-3">Keine ungelesene Mitteilungen</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-sheet>
        </v-col>

        <v-col class="d-flex flex-column pa-0">
          <v-sheet elevation="2" outlined class="align-self-center mt-16" width="30vw" :max-width="maxWidth">
            <v-toolbar>
              <v-toolbar-title>
                  Alle Mitteilungen
              </v-toolbar-title>
            </v-toolbar>

            <v-list max-height="70vh" class="overflow-y-auto" three-line v-if="notes.length > 0">
              <template v-for="(note, index) in notes">
                <v-list-item :key="note._id">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item-content
                        v-bind="attrs"
                        v-on="on">
                        <v-list-item-title v-html="note.title" class="text-h6 font-weight-regular"></v-list-item-title>
                        <v-list-item-subtitle v-html="note.context" class="text-subtitle-1"></v-list-item-subtitle>
                        <v-list-item-subtitle v-html="note.info" class="text-caption text--disabled text-right"></v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                    <span v-html="note.context"></span>
                  </v-tooltip>
                </v-list-item>

                <v-divider v-if="index < notes.length-1" :key="index"></v-divider>
              </template>
            </v-list>
            <v-list-item v-else>
              <v-list-item-content three-line>
                <v-list-item-title class="font-weight-light text-center py-3">Keine Mitteilungen</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-sheet>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import dayjs from 'dayjs'

export default {
  data: () => ({
    notes: [],
    unreadNotes: []
  }),
  computed : {
    maxWidth () {
      return window.innerWidth*0.8
    },
  },
  mounted(){
    this.getNotes()
  },
  methods: {
    refresh () {
      this.unreadNotes = []
      this.notes = []
      this.getNotes()
    },
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
    },
    readNote (note, index) {
      if (note.type !== 'declinedDateInvite') {
        this.unreadNotes.splice(index, 1);
        const body = {
          noteId: note._id,
          state: true,
        }
        fetch(process.env.VUE_APP_API_URL+'api/v1/notifications', {
          method: 'PATCH',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      }
    },
    stayOnDate (note, index, stayOn) {
      const body = {
        noteId: note._id,
        inviteId: note.data.invite_id,
        stay: stayOn,
      }
      fetch(process.env.VUE_APP_API_URL+'api/v1/notifications', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      this.unreadNotes.splice(index, 1);
    },
    getNotes () {
      fetch(process.env.VUE_APP_API_URL+'api/v1/notifications', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(notes => {
        const unreadNotes = []
        const allNotes = []
        notes.forEach(note => {
          switch (note.type) {
            case 'updatedGroupDate':
              note.title = 'Gruppen-Terminänderung - '+note.data.date_title
              note.context = 'An dem Gruppentermin <b>'+note.data.date_title+'</b> der Gruppe <b>'+note.data.date_group+'</b> am '
                +dayjs(note.data.date_date).format('DD.MM.YYYY')+' wurden Änderungen vorgenommen.'
              break;
            case 'deletedGroupDate':
              note.title = 'Terminlöschung - '+note.data.date_title
              note.context = 'Der Gruppentermin <b>'+note.data.date_title+'</b> der Gruppe <b>'+note.data.date_group+'</b> am '+dayjs(note.data.date_date).format('DD.MM.YYYY')+' wurde gelöscht.'
              break;
            case 'acceptedGroupInvite':
              note.title = 'Gruppeneinladung angenommen - '+note.data.group_title+' - '+note.data.username
              note.context = 'Der Benutzer <b>'+note.data.username+'</b> hat deine Einladung zu der Gruppe <b>'+note.data.group_title+' angenommen</b>.'
              break;
            case 'deniedGroupInvite':
              note.title = 'Gruppeneinladung abgelehnt - '+note.data.group_title+' - '+note.data.username
              note.context = 'Der Benutzer <b>'+note.data.username+'</b> hat deine Einladung zu der Gruppe <b>'+note.data.group_title+' abgelehnt</b>.'
              break;
            case 'appliedDateInvite':
              note.title = 'Neuer Gruppentermin bestätigt - '+note.data.group_title+' - '+note.data.date_title
              note.context = 'Alle Mitglieder des Termins <b>'+note.data.date_title+'</b> am <b>'+dayjs(note.data.date_date).format('DD.MM.YYYY')+'</b> haben die Einladung akzeptiert.'
              break;
            case 'acceptedDateInvite':
              note.title = 'Termineinladung angenommen - '+note.data.invite_title+' - '+note.data.acceptingUsername
              note.context = 'Der Benutzer <b>'+note.data.acceptingUsername+'</b> hat deine Einladung zu dem Termin <b>'+note.data.invite_title+' angenommen</b>.'
                +' Verbleibende Zusagen: '+note.data.acceptsLeft
              break;
            case 'declinedDateInvite':
              note.title = 'Termineinladung abgelehnt - '+note.data.invite_title+' - '+note.data.decliningUsername
              note.context = 'Der Benutzer <b>'+note.data.decliningUsername+'</b> hat deine Einladung zu dem Termin <b>'+note.data.invite_title+' abgelehnt</b>.'
              break;
            case 'stayOnDate':
              if (note.data.stay) {
                note.title = 'Abgelehnter Termin bleibt bestehen - '+note.data.invite_title
                note.context = 'Der Gruppentermin <b>'+note.data.invite_title+'</b> bleibt trotz deiner Absage bestehen.'
              } else {
                note.title = 'Abgelehnter Termin wird verschoben - '+note.data.invite_title
                note.context = 'Der Gruppentermin <b>'+note.data.invite_title+'</b> wird verschoben und die Einladungen zurück genommen.'
              }
              break;
            case 'deletedDateInvite':
              note.title = 'Gruppentermin-Einladung abgebrochen - '+note.data.invite_title+'-'+note.data.group_title
              note.context = 'Die Einladung zum Gruppentermin <b>'+note.data.invite_title+'</b> am <b> '+dayjs(note.data.date_date).format('DD.MM.YYYY')+' </b>wurde aufgrund zu weniger Zusagen abgebrochen.'
              break;
            case 'userKickedOutOfGroup':
              note.title = 'Du wurdest aus der Gruppe '+note.data.group_title+' gekickt'
              note.context = 'Der Administrator <b>'+note.data.kicker_username+'</b> der Gruppe <b>'+note.data.group_title+' </b>hat dich <b>gekickt</b>.'
              break;
          
            default:
              break;
          }
          note.info = '#'+note._id


          if(!note.read) {
            unreadNotes.push(note)
          }
          allNotes.push(note)

        });
        this.notes = allNotes.reverse();
        this.unreadNotes = unreadNotes.reverse();
      });
    }
  }
}
</script>
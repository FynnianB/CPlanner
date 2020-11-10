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
        <v-icon size="30" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
      </v-toolbar>

      <v-row class="fill-height ma-0">
        <v-col class="d-flex flex-column pa-0">
          <v-sheet elevation="2" outlined class="align-self-center mt-16" width="500">
            <v-toolbar>
              <v-badge color="primary" dot overlap bordered offset-x="3" offset-y="12" v-if="unread > 0">
                <v-toolbar-title>
                    Ungelesene Mitteilungen
                </v-toolbar-title>
              </v-badge>
              <v-toolbar-title v-else>
                  Ungelesene Mitteilungen
              </v-toolbar-title>
            </v-toolbar>

            <v-list max-height="600" class="overflow-y-auto" three-line>
              <template v-for="(note, index) in unreadNotes">
                <v-list-item :key="note._id">
                  <v-list-item-content>
                    <v-list-item-title v-html="note.title" class="text-h6 font-weight-regular"></v-list-item-title>
                    <v-list-item-subtitle v-html="note.context" class="text-subtitle-1"></v-list-item-subtitle>
                    <v-list-item-subtitle v-html="note.info" class="text-caption text--disabled text-right"></v-list-item-subtitle>
                    <v-list-item-action v-if="note.type !== 'declinedDateInvite'">
                      <v-row>
                        <div class="align-self-center">Bei dem Termin bleiben?</div>
                        <v-btn text icon large color="green lighten-2" class="ml-4">
                          <v-icon large>mdi-check</v-icon>
                        </v-btn>
                        <v-btn text icon large color="red lighten-2" class="ml-4">
                          <v-icon large>mdi-cancel</v-icon>
                        </v-btn>
                      </v-row>
                    </v-list-item-action>
                  </v-list-item-content>
                </v-list-item>

                <v-divider v-if="index < unreadNotes.length-1" :key="index"></v-divider>
              </template>
            </v-list>
          </v-sheet>
        </v-col>

        <v-col class="d-flex flex-column pa-0">
          <v-sheet elevation="2" outlined class="align-self-center mt-16" width="500">
            <v-toolbar>
              <v-toolbar-title>
                  Alle Mitteilungen
              </v-toolbar-title>
            </v-toolbar>

            <v-list max-height="600" class="overflow-y-auto" three-line>
              <template v-for="(note, index) in notes">
                <v-list-item :key="note._id">
                  <v-list-item-content>
                    <v-list-item-title v-html="note.title" class="text-h6 font-weight-regular"></v-list-item-title>
                    <v-list-item-subtitle v-html="note.context" class="text-subtitle-1"></v-list-item-subtitle>
                    <v-list-item-subtitle v-html="note.info" class="text-caption text--disabled text-right"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-divider v-if="index < unreadNotes.length-1" :key="index"></v-divider>
              </template>
            </v-list>
          </v-sheet>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    notes: [],
    unreadNotes: [],
    unread: 0
  }),
  mounted(){
    this.getNotes()
  },
  methods: {
    refresh () {
      notes = []
      this.getNotes()
    },
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
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
                +note.data.date_date+' wurden Änderungen vorgenommen.'
              break;
            case 'deletedGroupDate':
              note.title = 'Terminlöschung - '+note.data.date_title
              note.context = 'Der Gruppentermin <b>'+note.data.date_title+'</b> der Gruppe <b>'+note.data.date_group+'</b> am '+note.data.date_date+' wurde gelöscht.'
              break;
            case 'acceptedGroupInvite':
              note.title = 'Gruppeneinladung angenommen - '+note.data.group_title+' - '+note.data.username
              note.context = 'Der Benutzer <b>'+note.data.username+'</b> hat deine Einladung zu der Gruppe <b>'+note.data.group_title+' angenommen</b>.'
              break;
            case 'deniedGroupInvite':
              note.title = 'Gruppeneinladung abgelehnt - '+note.data.groupTitle+' - '+note.data.username
              note.context = 'Der Benutzer <b>'+note.data.username+'</b> hat deine Einladung zu der Gruppe <b>'+note.data.groupTitle+' abgelehnt</b>.'
              break;
            case 'appliedDateInvite':
              note.title = 'Neuer Gruppentermin - '+note.data.group_title+' - '+note.data.date_title
              note.context = 'Alle Mitglieder des Termins <b>'+note.data.date_title+'</b> haben die Einladung zum <b>'+note.data.date_date+'</b> akzeptiert.'
              break;
            case 'acceptedDateInvite':
              note.title = 'Termineinladung angenommen - '+note.data.invite_title+' - '+note.data.acceptingUsername
              note.context = 'Der Benutzer <b>'+note.data.acceptingUsername+'</b> hat deine Einladung zu dem Termin <b>'+note.data.invite_title+' angenommen</b>.'
                +'Verbleibende Zusagen: '+note.data.acceptsLeft
              break;
            case 'declinedDateInvite':
              note.title = 'Termineinladung abgelehnt - '+note.data.invite_title+' - '+note.data.decliningUsername
              note.context = 'Der Benutzer <b>'+note.data.decliningUsername+'</b> hat deine Einladung zu dem Termin <b>'+note.data.invite_title+' abgelehnt</b>.'
              break;
            case 'stayOnDate':
              note.title = 'Abgelehnter Termin bleibt bestehen - '+note.data.invite_title
              note.context = 'Der Gruppentermin <b>'+note.data.invite_title+'</b> bleibt trotz deiner Absage bestehen.'
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
        this.unread = unreadNotes.length
        this.notes = allNotes
        this.unreadNotes = unreadNotes
      });
    }
  }
}
</script>
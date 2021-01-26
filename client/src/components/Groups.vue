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
          Gruppen
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon size="25" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
      </v-toolbar>
      <v-btn
        color="primary"
        dark
        fixed
        bottom
        right
        fab
        @click.stop="createGroup"
        v-if="selectedGroup === null"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-speed-dial
        v-model="fab"
        bottom
        dark
        fixed
        right
        direction="top"
        transition="slide-y-reverse-transition"
        v-else
      >
        <template v-slot:activator>
          <v-btn
            v-model="fab"
            color="primary"
            dark
            fab
          >
            <v-icon v-if="fab">
              mdi-chevron-down
            </v-icon>
            <v-icon v-else>
              mdi-chevron-up
            </v-icon>
          </v-btn>
        </template>
        <v-btn
          fab
          dark
          :small="!deleteVerification"
          color="red"
          @click.stop="deleteVerification ? deleteGroup(selectedGroup) : deleteVerification = true"
          v-if="selectedAdmin"
          v-click-outside="onClickOutsideDeleteBtn"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="indigo"
          @click.stop="inviteUser"
          v-if="selectedAdmin"
        >
          <v-icon>mdi-account-plus</v-icon>
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="red"
          @click.stop="leaveGroup(selectedGroup)"
          v-if="!selectedAdmin"
        >
          <v-icon>mdi-logout</v-icon>
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="indigo"
          @click.stop="createGroupDate(selectedGroup)"
          v-if="selectedAdmin"
        >
          <v-icon>mdi-calendar-plus</v-icon>
        </v-btn>
        <v-btn
          fab
          dark
          small
          color="green"
          @click.stop="createGroup"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-speed-dial>

      <v-row no-gutters>
        <v-col md="3" class="border-right">
          <v-list class="overflow-y-auto" three-line v-if="groups.length > 0" :max-height="maxContentHeight">
            <template v-for="group in groups">
              <v-hover v-slot="{ hover }" :key="group._id">
                <v-list-item :class="hover ? 'groupItemHovered' : ''" @click.stop="showGroupInfo(group)">
                  <v-list-item-content>
                    <v-list-item-title v-html="group.title" class="text-h6 font-weight-regular"></v-list-item-title>
                    <v-list-item-subtitle v-html="group.desc" class="text-subtitle-1"></v-list-item-subtitle>
                    <v-list-item-subtitle v-html="'#'+group._id" class="text-caption text--disabled text-right"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-hover>
              <v-divider></v-divider> <!-- eslint-disable-line -->
            </template>
          </v-list>
          <v-list-item v-else>
            <v-list-item-content three-line>
              <v-list-item-title class="font-weight-light text-center py-3">Du bist in keiner Gruppe</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-col>
         <v-col md="9" class="pa-10" v-if="selectedGroup">
          <v-row>
            <v-col width="50%">
              <h1 v-html="selectedGroup.title"></h1>
              <p v-html="'<b>Beschreibung:</b> '+selectedGroup.desc" class="pt-5"></p>
              <p v-html="'<b>Ersteller:</b> '+selectedGroup.adminUsername"></p>
              <p v-html="'<b>Erstellt am:</b> '+selectedGroup.createdDate"></p>
              <v-sheet outlined width="50%" class="border-all mt-10">
                <v-toolbar elevation="0" outlined class="border-bottom">
                  <v-toolbar-title>
                      <b>Mitglieder</b>
                  </v-toolbar-title>
                </v-toolbar>

                <v-list max-height="50vh" class="overflow-y-auto pa-0" v-if="selectedGroup.members.length > 0" dense>
                  <template v-for="(member, index) in selectedGroup.members">
                    <v-list-item :key="member.memberId">
                      <v-list-item-avatar v-if="member.memberRole !== 'member'" class="mr-0 ml-n3">
                        <v-icon v-if="member.memberRole === 'admin'">mdi-crown</v-icon>
                        <v-icon v-if="member.memberRole === 'moderator'">mdi-knife-military</v-icon>
                      </v-list-item-avatar>
                      <v-list-item-content v-html="member.memberUsername" class="text-h6 font-weight-regular"></v-list-item-content>
                      <v-list-item-avatar class="ml-0 mr-n3" v-if="member.memberRole === 'member' && selectedAdmin">
                        <v-btn icon @click.stop="promoteUser(member, selectedGroup)"><v-icon color="blue">mdi-chevron-triple-up</v-icon></v-btn>
                      </v-list-item-avatar>
                      <v-list-item-avatar class="ml-0 mr-n3" v-if="member.memberRole === 'moderator' && selectedAdmin">
                        <v-btn icon @click.stop="demoteUser(member, selectedGroup)"><v-icon color="blue">mdi-chevron-triple-down</v-icon></v-btn>
                      </v-list-item-avatar>
                      <v-list-item-avatar class="ml-0 mr-n3" v-if="selectedAdmin && member.memberId !== getUser()._id && member.memberRole !== 'admin'">
                        <v-btn icon @click.stop="kickUser(member, selectedGroup)"><v-icon color="red">mdi-close</v-icon></v-btn>
                      </v-list-item-avatar>
                    </v-list-item>
                    <v-divider v-if="index < selectedGroup.members.length-1" :key="index"></v-divider>
                  </template>
                </v-list>
                <v-list-item v-else>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-light text-center py-3">Keine Mitglieder</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-sheet>
            </v-col>
            <v-col width="50%">
              <h1>Termine</h1>
              <v-sheet outlined class="border-all full-width mt-5">
                <v-list max-height="70vh" class="overflow-y-auto pa-0" three-line v-if="selectedGroup.events.length > 0">
                  <template v-for="(event, index) in selectedGroup.events">
                    <v-list-item :key="event._id">
                      <v-list-item-content>
                        <v-list-item-title v-html="event.name" class="text-h6 font-weight-regular"></v-list-item-title>
                        <v-list-item-subtitle v-html="event.desc" v-if="event.desc" class="text-subtitle-1"></v-list-item-subtitle>
                        <v-list-item-subtitle v-html="event.date" class="text-subtitle-1"></v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                    <v-divider v-if="index < selectedGroup.events.length-1" :key="index"></v-divider>
                  </template>
                </v-list>
                <v-list-item v-else>
                  <v-list-item-content three-line>
                    <v-list-item-title class="font-weight-light text-center py-3">Keine Termine</v-list-item-title>
                  </v-list-item-content>
                </v-list-item> 
              </v-sheet>
            </v-col>
          </v-row>
        </v-col> 
      </v-row>

      <!-- Create-Dialog -->

      <v-dialog
        v-model="createDialog"
        persistent
        max-width="600px">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              <v-toolbar-title class="headline">Neue Gruppe erstellen:</v-toolbar-title>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-alert
                    outlined
                    text
                    :type="alertBox.type"
                    v-model="alertBox.enabled"
                  >{{alertBox.context}}</v-alert>
                  <v-text-field
                    label="Titel*"
                    v-model="creatingGroup.name"
                    :counter="100"
                    required
                    color="primary"
                    filled
                    :error-messages="groupNameErrors"
                  ></v-text-field>
                  <v-textarea
                    auto-grow
                    prepend-icon="mdi-text-subject"
                    clearable
                    clearable-icon
                    color="primary"
                    placeholder="..."
                    :value="creatingGroup.desc"
                    label="Beschreibung"
                    rows="1"
                    v-model="creatingGroup.desc">
                  </v-textarea>
                </v-col>
              </v-row>
              <small>*erforderliche Felder</small>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click.stop="resetCreateDialog"
            >
              Schliessen
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click.stop="saveCreateDialog"
            >
              Erstellen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Invite-Dialog -->

      <v-dialog
        v-model="inviteDialog"
        persistent
        max-width="600px">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              <v-toolbar-title class="headline">Nutzer zur Gruppe einladen:</v-toolbar-title>
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pb-0">
            <v-container class="pb-0">
              <v-row>
                <v-col>
                  <v-alert
                    outlined
                    text
                    :type="inviteAlertBox.type"
                    v-model="inviteAlertBox.enabled"
                  >{{inviteAlertBox.context}}</v-alert>
                  <v-text-field
                    label="Nutzername"
                    v-model="invitingUser.name"
                    required
                    color="primary"
                    filled
                    :error-messages="usernameErrors"
                    clearable
                    autofocus
                    @keydown.enter="commitInviteDialog(selectedGroup)"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-spacer></v-spacer>
            <v-btn
              color="blue darken-1"
              text
              @click.stop="resetInviteDialog"
            >
              Schliessen
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click.stop="commitInviteDialog(selectedGroup)"
            >
              Einladen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->

      <v-dialog
        v-model="createEventDialog"
        persistent
        max-width="600px">
        <v-stepper v-model="createEventSteps">
          <v-stepper-header>
            <v-stepper-step
              :complete="createEventSteps > 1"
              step="1"
              editable
            >
              Termin erstellen
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step
              :complete="createEventSteps > 2"
              step="2"
            >
              Verfügbarkeit überprüfen
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card class="pb-0 mb-2 mt-n5" flat>
                <v-container>
                  <v-row>
                    <v-col>
                      <v-alert
                        outlined
                        text
                        :type="createEventAlertBox.type"
                        v-model="createEventAlertBox.enabled"
                      >{{createEventAlertBox.context}}</v-alert>
                      <v-text-field
                        label="Gruppe"
                        v-if="creatingEvent.group"
                        v-model="creatingEvent.group.title"
                        required
                        color="primary"
                        filled
                        disabled
                        readonly
                      ></v-text-field>
                      <v-text-field
                        label="Titel*"
                        v-model="creatingEvent.name"
                        :counter="100"
                        required
                        color="primary"
                        filled
                        :error-messages="nameErrors"
                      ></v-text-field>
                      <v-dialog
                        ref="dialog3"
                        v-model="createEventDatePicker"
                        :return-value.sync="creatingEvent.dates"
                        :v-click-outside="createEventDatePicker = false"
                        width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="creatingEvent.dates"
                            label="Tag(e)*"
                            prepend-icon="mdi-calendar"
                            readonly
                            required
                            v-bind="attrs"
                            v-on="on"
                            :error-messages="datesErrors"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="creatingEvent.dates"
                          scrollable
                          header-color="primary"
                          color="primary"
                          range
                        >
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click.stop="createEventDatePicker = false"
                          >
                            Schliessen
                          </v-btn>
                          <v-btn
                            text
                            color="primary"
                            @click.stop="$refs.dialog3.save(creatingEvent.dates)"
                          >
                            OK
                          </v-btn>
                        </v-date-picker>
                      </v-dialog>
                      <v-checkbox
                        v-model="creatingEvent.timed"
                        label="Ganztägig"
                        color="primary"
                        :true-value="false"
                        :false-value="true"
                      ></v-checkbox>
                      <v-dialog
                        ref="dialog4"
                        v-model="createEventTimePicker"
                        :return-value.sync="creatingEvent.times"
                        persistent
                        v-if="creatingEvent.timed"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-row>
                            <v-col>
                              <v-text-field
                                v-model="creatingEvent.times[0]"
                                label="Start"
                                prepend-icon="mdi-clock-time-four-outline"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </v-col>
                            <v-col>
                              <v-text-field
                                v-model="creatingEvent.times[1]"
                                label="Ende"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </template>
                        <v-row>
                          <v-col>
                            <v-time-picker
                              v-if="createEventTimePicker"
                              v-model="creatingEvent.times[0]"
                              full-width
                              header-color="primary"
                              color="primary"
                              :allowed-minutes="allowedTimeStep"
                              format="24hr"
                              @change="creatingEvent.times[1] = creatingEvent.times[0]"
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click.stop="createEventTimePicker = false"
                                :style="{visibility: 'hidden'}"
                              >
                                Schliessen
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click.stop="$refs.dialog4.save(creatingEvent.times)"
                                :style="{visibility: 'hidden'}"
                              >
                                OK
                              </v-btn>
                            </v-time-picker>
                          </v-col>
                          <v-col>
                            <v-time-picker
                              ref="timer"
                              v-if="createEventTimePicker"
                              v-model="creatingEvent.times[1]"
                              full-width
                              header-color="primary"
                              color="primary"
                              :allowed-minutes="allowedTimeStep"
                              format="24hr"
                              :min="creatingEvent.times[0]"
                            >
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click.stop="createEventTimePicker = false"
                              >
                                Schliessen
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click.stop="$refs.dialog4.save(creatingEvent.times)"
                              >
                                OK
                              </v-btn>
                            </v-time-picker>
                          </v-col>
                        </v-row>
                      </v-dialog>
                      <v-textarea
                        auto-grow
                        prepend-icon="mdi-map-marker-outline"
                        clearable
                        clearable-icon
                        color="primary"
                        placeholder="..."
                        :value="creatingEvent.location"
                        label="Ort"
                        rows="1"
                        v-model="creatingEvent.location">
                      </v-textarea>
                      <v-textarea
                        auto-grow
                        prepend-icon="mdi-text-subject"
                        clearable
                        clearable-icon
                        color="primary"
                        placeholder="..."
                        :value="creatingEvent.desc"
                        label="Beschreibung"
                        rows="1"
                        v-model="creatingEvent.desc">
                      </v-textarea>
                    </v-col>
                  </v-row>
                  <small>*erforderliche Felder</small>
                </v-container>
              </v-card>
              <v-btn
                color="primary"
                @click="nextCreateEventStep"
              >
                Weiter
              </v-btn>

              <v-btn text
                @click.stop="resetCreateEventDialog">
                Schliessen
              </v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-card class="pb-0 mb-2 mt-n5" flat>
                <v-container>
                  <v-row>
                    <v-col>
                      <span>An dem ausgewählten Tag des Gruppen-Termins können folgende Leute nicht:</span>
                      <v-list max-height="200px" class="overflow-y-auto pa-0" v-if="creatingEvent.unavailable && creatingEvent.unavailable.length > 0" dense>
                        <template v-for="member in creatingEvent.unavailable">
                          <v-list-item :key="member._id">
                            <v-list-item-content v-html="'<b>'+member.username+'</b>'"></v-list-item-content>
                          </v-list-item>
                        </template>
                      </v-list>
                      <v-list-item v-else>
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-light text-center py-3">Niemand hat dieses Termin als belegt angegeben</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <span v-if="creatingEvent.unavailable && creatingEvent.unavailable.length > 0">Möchtest du trotz dieser fehlenden Personen zu diesem Termin einladen oder noch einmal zurück gehen und den Termin ändern?</span>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
              <v-btn
                color="primary"
                @click="saveCreateEventDialog"
              >
                Einladungen verschicken
              </v-btn>
              <v-btn text
                @click.stop="createEventSteps = 1">
                Zurück
              </v-btn>
              <v-btn text
                @click.stop="resetCreateEventDialog">
                Schliessen
              </v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-dialog>

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
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { validationMixin } from 'vuelidate'
import { required, maxLength } from 'vuelidate/lib/validators'
import jwt from 'jsonwebtoken'

dayjs.extend(isSameOrAfter)

function minCreateDate(value) {
  if (this.creatingEvent.dates.length === 2) {
    return dayjs(value,'YYYY-MM-DD').isSameOrAfter(dayjs(this.creatingEvent.dates[0],'YYYY-MM-DD'))
  } else {
    return true
  }
}

export default {
  mixins: [validationMixin],
  validations: {
    creatingEvent: {
      name: { required, maxLength: maxLength(100) },
      dates:{
        required,
        0: { required },
        1: { minCreateDate },
      },
    },
    creatingGroup: {
      name: { required, maxLength: maxLength(100) },
    },
    invitingUser: {
      name: { required },
    },
  },
  data: () => ({
    groups: [],
    selectedGroup: null,
    selectedAdmin: false,
    events: [],
    creatingGroup: {},
    createDialog: false,
    alertBox: {
      enabled: false,
      type: 'error',
      context: '',
    },
    invitingUser: {},
    inviteDialog: false,
    inviteAlertBox: {
      enabled: false,
      type: 'error',
      context: '',
    },
    fab: false,
    error_sheet: {
      color: 'red',
      enabled: false,
      context: '',
    },
    deleteVerification: false,
    creatingEvent: { dates: [], times: ['00:00','00:00'], timed: false },
    createEventDatePicker: false,
    createEventTimePicker: false,
    allowedTimeStep: m => m % 5 === 0,
    createEventDialog: false,
    createEventAlertBox: {
      enabled: false,
      type: 'error',
      context: '',
    },
    createEventSteps: 1,
  }),
  computed : {
    maxContentHeight () {
      return window.innerHeight-64
    },
    groupNameErrors () {
      const errors = []
      if (!this.$v.creatingGroup.name.$dirty) return errors
      !this.$v.creatingGroup.name.maxLength && errors.push('Der Titel darf maximal 100 Zeichen lang sein')
      !this.$v.creatingGroup.name.required && errors.push('Der Titel ist erforderlich.')
      return errors
    },
    usernameErrors () {
      const errors = []
      if (!this.$v.invitingUser.name.$dirty) return errors
      !this.$v.invitingUser.name.required && errors.push('Der Nutzername ist erforderlich.')
      return errors
    },
    nameErrors () {
      const errors = []
      if (!this.$v.creatingEvent.name.$dirty) return errors
      !this.$v.creatingEvent.name.maxLength && errors.push('Der Titel darf maximal 100 Zeichen lang sein')
      !this.$v.creatingEvent.name.required && errors.push('Der Titel ist erforderlich.')
      return errors
    },
    datesErrors () {
      const errors = []
      if (!this.$v.creatingEvent.dates.$dirty) return errors
      !this.$v.creatingEvent.dates[0].required && errors.push('Der Tag ist erforderlich.')
      !this.$v.creatingEvent.dates[1].minCreateDate && errors.push('Der Start des Termins muss vor dem Ende liegen.')
      return errors
    },
  },
  mounted(){
    this.groups = []
    this.getGroups()
    this.events = []
    this.getEvents()
  },
  methods: {
    getUser () {
      return jwt.decode(localStorage.token)
    },
    refresh () {
      this.groups = []
      this.getGroups()
      this.events = []
      this.getEvents()
      this.selectedGroup = null
      this.selectedAdmin = false
      this.fab = false
    },
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
    },
    getGroups () {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(foundGroups => {
        this.groups = foundGroups;
      });
    },
    resetCreateDialog () {
      this.$v.creatingGroup.$reset()
      this.createDialog = false
      this.creatingGroup = {}
      this.resetAlertBox()
    },
    createGroup () {
      this.resetCreateDialog()
      this.createDialog = true
    },
    resetAlertBox () {
      this.alertBox.enabled = false
      this.alertBox.type = 'error'
      this.alertBox.context = ''
    },
    saveCreateDialog () {
      this.$v.creatingGroup.$touch()
      if (!this.$v.creatingGroup.$invalid) {
        this.resetAlertBox()
        const group = {
          title: this.creatingGroup.name,
        }
        if (this.creatingGroup.desc) {
          group.desc = this.creatingGroup.desc
        }
        fetch(process.env.VUE_APP_API_URL+'api/v1/groups/', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(group),
        }).then(res => res.json())
        .then(res => {
          if (res.message) {
            this.alertBox.type = 'error'
            switch (res.message) {
              case '"title" is required':
                this.alertBox.context = 'Der Titel ist erforderlich'
                break
              default:
                this.alertBox.context = res.message
                break
            }
            this.alertBox.enabled = true
          } else {
            this.resetCreateDialog()
            this.refresh()
          }
        });
      }
    },
    resetInviteDialog () {
      this.$v.invitingUser.$reset()
      this.inviteDialog = false
      this.invitingUser = {}
      this.resetInviteAlertBox()
    },
    inviteUser () {
      this.resetInviteDialog()
      this.inviteDialog = true
    },
    resetInviteAlertBox () {
      this.inviteAlertBox.enabled = false
      this.inviteAlertBox.type = 'error'
      this.inviteAlertBox.context = ''
    },
    commitInviteDialog (group) {
      this.$v.invitingUser.$touch()
      if (!this.$v.invitingUser.$invalid) {
        this.resetInviteAlertBox()
        fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id, {
          method: 'POST',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ username: this.invitingUser.name }),
        }).then(res => res.json())
        .then(res => {
          if (res.message) {
            this.inviteAlertBox.type = 'error'
            switch (res.message) {
              case 'User already in group':
                this.inviteAlertBox.context = 'Der Nutzer ist bereits in der Gruppe'
                break
              case 'Unauthorized':
                this.inviteAlertBox.context = 'Nur der Administrator und die Moderatoren können Nutzer einladen'
                break
              case 'Invite already send':
                this.inviteAlertBox.context = 'Einladung bereits an diesen Nutzer versendet'
                break
              default:
                this.inviteAlertBox.context = 'Der Nutzer konnte nicht gefunden werden'
                break
            }
            this.inviteAlertBox.enabled = true
          } else {
            this.resetInviteDialog()
          }
        });
      }
    },
    promoteUser (user, group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id+'/'+user.memberId, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ role: 'admin' })
      }).then(res => res.json())
      .then(res => {
        if (res.message) {
          this.error_sheet.context = 'Beim Promote-Vorgang ist ein Fehler aufgetreten'
          this.error_sheet.enabled = true
          this.error_sheet.color = 'red'
        } else {
          this.refresh()
        }
      });
    },
    demoteUser (user, group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id+'/'+user.memberId, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ role: 'member' })
      }).then(res => res.json())
      .then(res => {
        if (res.message) {
          this.error_sheet.context = 'Beim Demote-Vorgang ist ein Fehler aufgetreten'
          this.error_sheet.enabled = true
          this.error_sheet.color = 'red'
        } else {
          this.refresh()
        }
      });
    },
    kickUser (user, group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id+'/'+user.memberId, {
        method: 'PATCH',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ delete: true })
      }).then(res => res.json())
      .then(res => {
        if (res.message && res.message !== 'User kicked from Group') {
          this.error_sheet.context = 'Beim Kick-Vorgang ist ein Fehler aufgetreten'
          this.error_sheet.enabled = true
          this.error_sheet.color = 'red'
        } else {
          this.refresh()
        }
      });
    },
    leaveGroup (group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ state: 'remove' })
      }).then(res => res.json())
      .then(res => {
        if (res.message && res.message !== 'User removed from Group') {
          switch (res.message) {
            case 'The admin cannot leave his group':
              this.error_sheet.context = 'Die Administratoren können die Gruppen nicht verlassen, sondern nur die gesamte Gruppe Löschen'
              break
            default:
              this.error_sheet.context = 'Beim Verlassen-Vorgang ist ein Fehler aufgetreten'
              break
          }
          this.error_sheet.enabled = true
          this.error_sheet.color = 'red'
        } else {
          this.refresh()
        }
      });
    },
    deleteGroup (group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(res => {
        if (res.message && res.message !== 'Group succesfully removed') {
          this.error_sheet.context = 'Beim Lösch-Vorgang ist ein Fehler aufgetreten'
          this.error_sheet.enabled = true
          this.error_sheet.color = 'red'
        } else {
          this.refresh()
        }
      });
    },
    resetCreateEventAlertBox () {
      this.createEventAlertBox.enabled = false
      this.createEventAlertBox.type = 'error'
      this.createEventAlertBox.context = ''
    },
    resetCreateEventDialog () {
      this.$v.creatingEvent.$reset()
      this.createEventDialog = false
      this.creatingEvent = { dates: [], times: ['00:00','00:00'], timed: false }
      this.resetCreateEventAlertBox()
      this.createEventSteps = 1
    },
    createGroupDate (group) {
      this.resetCreateEventDialog()
      this.createEventDialog = true
      this.creatingEvent.group = group
    },
    nextCreateEventStep () {
      this.$v.creatingEvent.$touch()
      if (!this.$v.creatingEvent.$invalid) {
        if (!this.creatingEvent.timed) {
          this.creatingEvent.times[0] = '00:00'
          this.creatingEvent.times[1] = '00:00'
        }
        if (!this.creatingEvent.dates[1]) {
          this.creatingEvent.dates[1] = this.creatingEvent.dates[0]
        }
        const startStr = dayjs(this.creatingEvent.dates[0]+'-'+this.creatingEvent.times[0], 'YYYY-MM-DD-HH:mm').toISOString();
        const endStr = dayjs(this.creatingEvent.dates[1]+'-'+this.creatingEvent.times[1], 'YYYY-MM-DD-HH:mm').toISOString();
        const content = {
          group: this.creatingEvent.group._id,
          from: startStr,
          to: endStr,
        }
        fetch(process.env.VUE_APP_API_URL+'api/v1/invites', {
          method: 'PUT',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(content),
        }).then(res => res.json())
        .then(res => {
          if (res.message) {
            this.alertBox.type = 'error'
            switch (res.message) {
              case 'Not allowed':
                this.alertBox.context = 'Nur der Administrator und Moderatoren können zu Gruppen-Terminen einladen'
                break
              default:
                this.alertBox.context = 'Beim Testen auf Verfügbarkeit ist ein Fehler aufgetreten'
                break
            }
            this.alertBox.enabled = true
          } else {
            this.creatingEvent.unavailable = res
            this.createEventSteps = 2
          }
        });
      }
    },
    saveCreateEventDialog () {
      this.$v.creatingEvent.$touch()
      if (!this.$v.creatingEvent.$invalid) {
        this.resetCreateEventAlertBox()
        if (!this.creatingEvent.timed) {
          this.creatingEvent.times[0] = '00:00'
          this.creatingEvent.times[1] = '00:00'
        }
        if (!this.creatingEvent.dates[1]) {
          this.creatingEvent.dates[1] = this.creatingEvent.dates[0]
        }
        const startStr = dayjs(this.creatingEvent.dates[0]+'-'+this.creatingEvent.times[0], 'YYYY-MM-DD-HH:mm').toISOString();
        const endStr = dayjs(this.creatingEvent.dates[1]+'-'+this.creatingEvent.times[1], 'YYYY-MM-DD-HH:mm').toISOString();
        const event = {
          title: this.creatingEvent.name,
          from: startStr,
          to: endStr,
        }
        if (this.creatingEvent.desc) {
          event.desc = this.creatingEvent.desc
        }
        if (this.creatingEvent.location) {
          event.location = this.creatingEvent.location
        }
        event.group = this.creatingEvent.group._id
        fetch(process.env.VUE_APP_API_URL+'api/v1/invites', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify(event),
        }).then(res => res.json())
        .then(res => {
          if (res.message) {
            this.alertBox.type = 'error'
            switch (res.message) {
              case '"title" is required':
                this.alertBox.context = 'Der Titel ist erforderlich'
                break
              case '"from" is required':
                this.alertBox.context = 'Der Start ist erforderlich'
                break
              case '"from" must be a valid date':
                this.alertBox.context = 'Der Start muss ein Tag sein'
                break
              case '"to" is required':
                this.alertBox.context = 'Das Ende ist erforderlich'
                break
              case '"to" must be a valid date':
                this.alertBox.context = 'Das Ende muss ein Tag sein'
                break
              case '"to" must be greater than or equal to "ref:from"':
                this.alertBox.context = 'Der Start darf nicht vor dem Ende liegen'
                break
              case 'Not allowed':
                this.alertBox.context = 'Nur der Administrator und Moderatoren können zu Gruppen-Terminen einladen'
                break
              case 'Invite already exists':
                this.alertBox.context = 'Einladungen bereits verschickt'
                break
              default:
                this.alertBox.context = 'Beim Verschicken der Einladungen ist ein Fehler aufgetreten'
                break
            }
            this.alertBox.enabled = true
          } else {
            this.resetCreateEventDialog()
            this.error_sheet.context = 'Einladungen zu dem Gruppen-Termin erfolgreich verschickt'
            this.error_sheet.color = 'green'
            this.error_sheet.enabled = true
          }
        });
      }
    },
    showGroupInfo (group) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/groups/'+group._id, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
      }).then(res => res.json())
      .then(foundGroupInfo => {
        this.selectedGroup = foundGroupInfo;
        const d = new Date(this.selectedGroup.created).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const time = new Date(this.selectedGroup.created).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
        this.selectedGroup.createdDate = d+', '+time+'h'
        this.selectedGroup.events = []
        this.events.forEach((event, i, array) => {
          if (event.group && event.group === group._id) {
            event.date = dayjs(event.start).format('DD.MM.YYYY')
            if (event.timed) {
              event.date += ' '+event.times[0]+'h'
            }
            if (event.location) {
              event.date += ', '+event.location
            }
            this.selectedGroup.events.push(event)
          }
        })
        if (this.selectedGroup.admin === jwt.decode(localStorage.token)._id) {
          this.selectedAdmin = true
        }
      });
    },
    getEvents () {
      fetch(process.env.VUE_APP_API_URL+'api/v1/calendars', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: dayjs(new Date()).subtract(1, 'year').toISOString().substring(0,10),
          to: dayjs(new Date()).add(1, 'year').toISOString().substring(0,10)
        }),
      }).then(res => res.json())
      .then(dates => {
        const events = dates.map(function(row) {
          const event = {
            end: new Date(row.to),
            name: row.title,
            start: new Date(row.from),
            timed: true,
            desc: row.desc,
            location: row.location,
            _id: row._id,
            dates: [dayjs(row.from).format('YYYY-MM-DD'), dayjs(row.to).format('YYYY-MM-DD')],
            times: [
              new Date(row.from).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'}),
              new Date(row.to).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})
            ],
          };
          if (dayjs(row.from).format('YYYY-MM-DD') === dayjs(row.to).format('YYYY-MM-DD')) {
            event.dates = [dayjs(row.from).format('YYYY-MM-DD')]
          }
          if (event.start.getHours()===0&&event.start.getMinutes()===0) {
            event.timed = false;
          }
          if (row.group) {
            event.group = row.group
            event.group_title = row.group_title
          }
          return event;
        });
        this.events = events;
      });
    },
    onClickOutsideDeleteBtn () {
      this.deleteVerification = false
    },
  }
}
</script>

<style>
  .border-right {
    border-right: gray 2px solid;
  }
  .border-all {
    border: gray 2px solid !important;
  }
  .border-bottom {
    border-bottom: gray 2px solid !important;
  }
  .groupItemHovered {
    background-color: #E1E1E1;
    cursor: pointer;
  }
</style>
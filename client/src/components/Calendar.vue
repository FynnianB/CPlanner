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
        <v-btn outlined class="mr-4 ml-4" color="grey darken-2" @click.stop="setToday">
          Heute
        </v-btn>
        <v-btn fab text small color="grey darken-2" @click.stop="prev">
          <v-icon small>
            mdi-chevron-left
          </v-icon>
        </v-btn>
        <v-btn fab text small color="grey darken-2" @click.stop="next">
          <v-icon small>
            mdi-chevron-right
          </v-icon>
        </v-btn>
        <v-toolbar-title v-if="$refs.calendar" class="mr-4">
          {{ $refs.calendar.title }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-icon size="30" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
        <v-menu bottom right>
          <template v-slot:activator="{ on, attrs }">
            <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
              <span>{{ typeToLabel[type] }}</span>
              <v-icon right>
                mdi-menu-down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="type = 'month'">
              <v-list-item-title>Monat</v-list-item-title>
            </v-list-item>
            <v-list-item @click="type = 'week'">
              <v-list-item-title>Woche</v-list-item-title>
            </v-list-item>
            <v-list-item @click="type = 'day'">
              <v-list-item-title>Tag</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar>
      
      <!-- Calendar -->

      <v-sheet class="flex-grow-1">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="de"
          :events="events"
          :event-color="getEventColor"
          :type="type"
          :weekdays="weekday"
          event-overlap-mode="column"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @click:day="createEvent"
          @change="updateRange"
          v-touch="{
            left: () => prev(),
            right: () => next()
          }"
        ></v-calendar>
        <v-btn
          color="primary"
          dark
          fixed
          bottom
          right
          fab
          @click.stop="createEvent"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>

        <!-- Event Info -->

        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          :close-on-click="currentlyEditing !== selectedEvent._id ? true : false"
          offset-x
          offset-overflow
          min-width="350px">
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn
                v-if="currentlyEditing !== selectedEvent._id"
                icon
                @click.stop="editEvent(selectedEvent)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                v-else
                icon
                @click.stop="saveEvent(selectedEvent)">
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
              <v-btn
                v-if="currentlyEditing !== selectedEvent._id"
                @click.stop="deleteEvent(selectedEvent)"
                icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-btn @click.stop="closeEvent(selectedEvent)" icon>
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text v-if="currentlyEditing !== selectedEvent._id">
              <v-alert
                outlined
                text
                :type="eventAlertBox.type"
                v-model="eventAlertBox.enabled"
              >{{eventAlertBox.context}}</v-alert>
              <v-col v-if="selectedEvent.start">
                <v-icon class="mr-1">mdi-calendar</v-icon>
                <span
                  v-html="selectedEvent.start.toLocaleDateString('de-DE', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})">
                </span>
                <v-icon
                  v-if="selectedEvent.timed">
                  mdi-circle-small
                </v-icon>
                <span
                  v-if="selectedEvent.timed"
                  v-html="selectedEvent.start.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})+' Uhr'">
                </span>
                <span
                  v-if="selectedEvent.timed && selectedEvent.start !== selectedEvent.end"
                  v-html="' - '+selectedEvent.end.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})+' Uhr'">
                </span>
              </v-col>
              <v-col v-if="selectedEvent.location">
                <v-icon class="mr-1">mdi-map-marker-outline</v-icon>
                <span v-html="selectedEvent.location"></span>
              </v-col>
              <v-col v-if="selectedEvent.desc">
                <v-icon class="mr-1">mdi-text-subject</v-icon>
                <span v-html="selectedEvent.desc"></span>
              </v-col>
            </v-card-text>
            <v-card-text v-else>
              <v-alert
                outlined
                text
                :type="eventAlertBox.type"
                v-model="eventAlertBox.enabled"
              >{{eventAlertBox.context}}</v-alert>
              <v-text-field
                label="Titel"
                v-model="selectedEvent.name"
                :value="selectedEvent.name"
                :color="selectedEvent.color"
                filled
                :error-messages="editNameErrors">
              </v-text-field>
              <v-col>
                <v-dialog
                  ref="dialog"
                  v-model="datePicker"
                  :return-value.sync="selectedEvent.dates"
                  :v-click-outside="datePicker = false"
                  width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="selectedEvent.dates"
                      label="Tag(e)"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      :error-messages="editDatesErrors"
                    ></v-text-field>
                    <v-checkbox
                      v-model="selectedEvent.timed"
                      label="Ganztägig"
                      color="calendar"
                      :true-value="false"
                      :false-value="true"
                    ></v-checkbox>
                  </template>
                  <v-date-picker
                    v-model="selectedEvent.dates"
                    scrollable
                    :header-color="selectedEvent.color"
                    :color="selectedEvent.color"
                    range
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="calendar"
                      @click.stop="datePicker = false"
                    >
                      Schliessen
                    </v-btn>
                    <v-btn
                      text
                      color="calendar"
                      @click.stop="$refs.dialog.save(selectedEvent.dates)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-dialog>
                <v-dialog
                  ref="dialog2"
                  v-model="timePicker"
                  :return-value.sync="selectedEvent.times"
                  persistent
                  v-if="selectedEvent.timed"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-row>
                      <v-col>
                        <v-text-field
                          v-model="selectedEvent.times[0]"
                          label="Start"
                          prepend-icon="mdi-clock-time-four-outline"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </v-col>
                      <v-col>
                        <v-text-field
                          v-model="selectedEvent.times[1]"
                          label="Ende"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </template>
                  <v-row style="margin: 0">
                    <v-col>
                      <v-time-picker
                        v-if="timePicker"
                        v-model="selectedEvent.times[0]"
                        full-width
                        :header-color="selectedEvent.color"
                        :color="selectedEvent.color"
                        :allowed-minutes="allowedTimeStep"
                        format="24hr"
                        @change="selectedEvent.times[1] = selectedEvent.times[0]"
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="calendar"
                          @click.stop="timePicker = false"
                          :style="{visibility: 'hidden'}"
                        >
                          Schliessen
                        </v-btn>
                        <v-btn
                          text
                          color="calendar"
                          @click.stop="$refs.dialog2.save(selectedEvent.times)"
                          :style="{visibility: 'hidden'}"
                        >
                          OK
                        </v-btn>
                      </v-time-picker>
                    </v-col>
                    <v-col>
                      <v-time-picker
                        ref="timer"
                        v-if="timePicker"
                        v-model="selectedEvent.times[1]"
                        full-width
                        :header-color="selectedEvent.color"
                        :color="selectedEvent.color"
                        :allowed-minutes="allowedTimeStep"
                        format="24hr"
                        :min="selectedEvent.times[0]"
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="calendar"
                          @click.stop="timePicker = false"
                        >
                          Schliessen
                        </v-btn>
                        <v-btn
                          text
                          color="calendar"
                          @click.stop="$refs.dialog2.save(selectedEvent.times)"
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
                  :color="selectedEvent.color"
                  placeholder="..."
                  :value="selectedEvent.location"
                  label="Ort"
                  rows="1"
                  v-model="selectedEvent.location">
                </v-textarea>
                <v-textarea
                  auto-grow
                  prepend-icon="mdi-text-subject"
                  clearable
                  clearable-icon
                  :color="selectedEvent.color"
                  placeholder="..."
                  :value="selectedEvent.desc"
                  label="Beschreibung"
                  rows="1"
                  v-model="selectedEvent.desc">
                </v-textarea>
              </v-col>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-sheet>

      <!-- Create Dialog -->

      <v-dialog
        v-model="createDialog"
        persistent
        max-width="600px">
        <v-card>
          <v-toolbar color="primary" dark>
            <v-toolbar-title>
              <v-toolbar-title class="headline">Neuen Termin erstellen:</v-toolbar-title>
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
                    v-model="creatingEvent.name"
                    :counter="100"
                    required
                    color="primary"
                    filled
                    :error-messages="nameErrors"
                  ></v-text-field>
                  <v-dialog
                    ref="dialog3"
                    v-model="createDatePicker"
                    :return-value.sync="creatingEvent.dates"
                    :v-click-outside="createDatePicker = false"
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
                        @click.stop="createDatePicker = false"
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
                    v-model="createTimePicker"
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
                          v-if="createTimePicker"
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
                            @click.stop="createTimePicker = false"
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
                          v-if="createTimePicker"
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
                            @click.stop="createTimePicker = false"
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
              Speichern
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-col>
  </v-row>
</template>

<script>
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { validationMixin } from 'vuelidate'
import { required, maxLength } from 'vuelidate/lib/validators'

dayjs.extend(isSameOrAfter)

function minCreateDate(value) {
  if (this.creatingEvent.dates.length === 2) {
    return dayjs(value,'YYYY-MM-DD').isSameOrAfter(dayjs(this.creatingEvent.dates[0],'YYYY-MM-DD'))
  } else {
    return true
  }
}
function minEditDate(value) {
  if (this.selectedEvent.dates.length === 2) {
    return dayjs(value,'YYYY-MM-DD').isSameOrAfter(dayjs(this.selectedEvent.dates[0],'YYYY-MM-DD'))
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
    selectedEvent: {
      name: { required, maxLength: maxLength(100) },
      dates:{
        required,
        0: { required },
        1: { minEditDate },
      },
    },
  },
  data: () => ({
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
    },
    weekday: [1, 2, 3, 4, 5, 6, 0],
    creatingEvent: { dates: [], times: ['00:00','00:00'], timed: false },
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    currentlyEditing: '',
    datePicker: false,
    createDatePicker: false,
    timePicker: false,
    createTimePicker: false,
    allowedTimeStep: m => m % 5 === 0,
    createDialog: false,
    alertBox: {
      enabled: false,
      type: 'error',
      context: '',
    },
    eventAlertBox: {
      enabled: false,
      type: 'error',
      context: '',
    },
  }),
  mounted () {
    this.$refs.calendar.checkChange();
  },
  computed: {
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
      !this.$v.creatingEvent.dates[1].minDate && errors.push('Der Start des Termins muss vor dem Ende liegen.')
      return errors
    },
    editNameErrors () {
      const errors = []
      if (!this.$v.selectedEvent.name.$dirty) return errors
      !this.$v.selectedEvent.name.maxLength && errors.push('Der Titel darf maximal 100 Zeichen lang sein')
      !this.$v.selectedEvent.name.required && errors.push('Der Titel ist erforderlich.')
      return errors
    },
    editDatesErrors () {
      const errors = []
      if (!this.$v.selectedEvent.dates.$dirty) return errors
      !this.$v.selectedEvent.dates[0].required && errors.push('Der Tag ist erforderlich.')
      !this.$v.selectedEvent.dates[1].minDate && errors.push('Der Start des Termins muss vor dem Ende liegen.')
      return errors
    },
  },
  methods: {
    refresh () {
      this.resetCreateDialog()
      this.events = []
      this.updateRange({ start: this.start, end: this.end })
    },
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
    },
    resetAlertBox () {
      this.alertBox.enabled = false
      this.alertBox.type = 'error'
      this.alertBox.context = ''
    },
    resetEventAlertBox () {
      this.eventAlertBox.enabled = false
      this.eventAlertBox.type = 'error'
      this.eventAlertBox.context = ''
    },
    viewDay ({ date }) {
      if (this.currentlyEditing === '') {
        this.focus = date
        this.type = 'day'
      }
    },
    getEventColor (event) {
      return event.color
    },
    setToday () {
      this.focus = ''
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    saveCreateDialog () {
      this.$v.creatingEvent.$touch()
      if (!this.$v.creatingEvent.$invalid) {
        this.resetAlertBox()
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
        fetch(process.env.VUE_APP_API_URL+'api/v1/calendars/', {
          method: 'PUT',
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
              default:
                this.alertBox.context = res.message
                break
            }
            this.alertBox.enabled = true
          } else {
            this.resetCreateDialog()
            this.events = []
            this.updateRange({ start: this.start, end: this.end })
          }
        });
      }
    },
    resetCreateDialog () {
      this.$v.creatingEvent.$reset()
      this.createDialog = false
      this.creatingEvent = { dates: [], times: ['00:00','00:00'], timed: false }
      this.resetAlertBox()
    },
    createEvent ({ date }) {
      if (this.currentlyEditing === '') {
        this.resetCreateDialog()
        if (date) {
          this.creatingEvent.dates = [date]
        }
        this.createDialog = true
      }
    },
    editEvent (ev) {
      this.currentlyEditing = ev._id
    },
    saveEvent (ev) {
      this.$v.selectedEvent.$touch()
      if (!this.$v.selectedEvent.$invalid) {
        if (!ev.timed) {
          ev.times[0] = '00:00'
          ev.times[1] = '00:00'
        }
        if (!ev.dates[1]) {
          ev.dates[1] = ev.dates[0]
        }
        const startStr = dayjs(ev.dates[0]+'-'+ev.times[0], 'YYYY-MM-DD-HH:mm').toISOString();
        const endStr = dayjs(ev.dates[1]+'-'+ev.times[1], 'YYYY-MM-DD-HH:mm').toISOString();
        fetch(process.env.VUE_APP_API_URL+'api/v1/calendars/'+ev._id, {
          method: 'PATCH',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            title: ev.name,
            from: startStr,
            to: endStr,
            desc: ev.desc,
            location: ev.location,
          }),
        }).then(res => res.json())
        .then(res => {
          if (res.message) {
            this.eventAlertBox.type = 'error'
            switch (res.message) {
              case '"title" is not allowed to be empty':
              case '"title" is required':
                this.eventAlertBox.context = 'Der Titel ist erforderlich'
                break
              case '"from" is required':
                this.eventAlertBox.context = 'Der Start ist erforderlich'
                break
              case '"from" must be a valid date':
                this.eventAlertBox.context = 'Der Start muss ein Tag sein'
                break
              case '"to" is required':
                this.eventAlertBox.context = 'Das Ende ist erforderlich'
                break
              case '"to" must be a valid date':
                this.eventAlertBox.context = 'Das Ende muss ein Tag sein'
                break
              case '"to" must be greater than or equal to "ref:from"':
                this.eventAlertBox.context = 'Der Start darf nicht vor dem Ende liegen'
                break
              default:
                this.eventAlertBox.context = 'Beim Speichern ist ein Fehler aufgetreten'
                break
            }
            this.eventAlertBox.enabled = true
          } else {
            this.selectedOpen = false
            this.currentlyEditing = ''
            this.$v.selectedEvent.$reset()
            this.events = []
            this.updateRange({ start: this.start, end: this.end })
          }
        });
      }
    },
    deleteEvent (ev) {
      fetch(process.env.VUE_APP_API_URL+'api/v1/calendars/'+ev._id, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
        },
      }).then(res => res.json())
      .then(res => {
        if (res.message && res.message !== 'Date deleted') {
          this.eventAlertBox.type = 'error'
          this.eventAlertBox.context = 'Beim Löschen ist ein Fehler aufgetreten'
          this.eventAlertBox.enabled = true
        } else {
          this.selectedOpen = false
          this.currentlyEditing = ''
          this.events = []
          this.updateRange({ start: this.start, end: this.end })
        }
      });
    },
    closeEvent (ev) {
      this.selectedOpen = false
      if (this.currentlyEditing === ev._id) {
        this.events = []
        this.updateRange({ start: this.start, end: this.end })
      }
      this.currentlyEditing = ''
      this.$v.selectedEvent.$reset()
    },
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        this.currentlyEditing = ''
        this.$v.selectedEvent.$reset()
        setTimeout(() => {
          this.selectedOpen = true
          this.resetEventAlertBox()
        }, 10)
      }
      
      if (this.selectedOpen) {
        if (this.currentlyEditing === '') {
          this.selectedOpen = false
          setTimeout(open, 10)
        }
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    },
    updateRange ({ start, end }) {
      this.start = start
      this.end = end
      fetch(process.env.VUE_APP_API_URL+'api/v1/calendars', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${localStorage.token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          from: dayjs(new Date(this.start.date)).subtract(1, 'week').toISOString().substring(0,10),
          to: dayjs(new Date(this.end.date)).add(1, 'week').toISOString().substring(0,10)
        }),
      }).then(res => res.json())
      .then(dates => {
        const events = dates.map(function(row) {
          const event = {
            color: 'calendar',
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
          if (event.start.getHours()===0&&event.start.getMinutes()===0&&event.end.getHours()===0&&event.end.getMinutes()===0) {
            event.timed = false;
          }
          return event;
        });
        this.events = events;
      });
    },
  },
}
</script>
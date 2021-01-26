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
        <v-icon size="25" class="mr-4" @click.stop="refresh">
          mdi-refresh
        </v-icon>
      </v-toolbar>
      
      <!-- Calendar -->

      <v-sheet class="flex-grow-1">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          locale="de"
          type="month"
          :weekdays="weekday"
          @click:day="selectDay"
          @change="updateRange"
          v-touch="{
            left: () => prev(),
            right: () => next()
          }"
        >
          <template v-slot:day="{ date }">
            <v-row class="fill-height">
              <template v-if="getDateObject(date)">
                <div class="disabled"></div>
              </template>
            </v-row>
          </template>
        </v-calendar>
      </v-sheet>

      <v-snackbar
        v-model="error_sheet.enabled"
        timeout="2500"
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
    focus: '',
    weekday: [1, 2, 3, 4, 5, 6, 0],
    dates: [],
    error_sheet: {
      color: 'red',
      enabled: false,
      context: '',
    },
  }),
  mounted () {
    this.$refs.calendar.checkChange();
    this.$refs.calendar.move(0)
  },
  methods: {
    enableNavDrawer () {
      this.$store.commit('setNavDrawer',true)
    },
    refresh () {
      this.dates = []
      this.updateRange({ start: this.start, end: this.end })
    },
    getDateObject(datestr) {
      return this.dates.find(date => date.date_str === datestr)
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
    selectDay ({ date }) {
      const dateobj = this.dates.find(dateobj => dateobj.date_str === date)
      const state = dateobj ? false : true
      if (state) {
        const datestr = dayjs(date).toISOString()
        fetch(process.env.VUE_APP_API_URL+'api/v1/disabled', {
          method: 'PUT',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            from: datestr,
            to: datestr
          }),
        }).then(res => res.json())
        .then(res => {
          if (res.message && res.message !== 'Disabled dates inserted'){
            this.error_sheet.context = 'Beim Hinzufügen ist ein Fehler aufgetreten'
            this.error_sheet.color = 'error'
            this.error_sheet.enabled = true
          }
          this.refresh()
        });
      } else {
        fetch(process.env.VUE_APP_API_URL+'api/v1/disabled', {
          method: 'DELETE',
          headers: {
            authorization: `Bearer ${localStorage.token}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            dates: [dateobj._id.toString()]
          }),
        }).then(res => res.json())
        .then(res => {
          if (res.message && res.message !== 'Disabled dates deleted'){
            this.error_sheet.context = 'Beim Entfernen ist ein Fehler aufgetreten'
            this.error_sheet.color = 'error'
            this.error_sheet.enabled = true
          }
          this.refresh()
        });
      }
    },
    updateRange ({ start, end }) {
      this.start = start
      this.end = end
      fetch(process.env.VUE_APP_API_URL+'api/v1/disabled', {
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
        const disabled = dates.map(function(row) {
          const date = {
            _id: row._id,
            date: row.date,
            date_str: new Date(row.date).getFullYear()+'-'+('0'+(new Date(row.date).getMonth()+1)).slice(-2)+'-'+('0'+new Date(row.date).getDate()).slice(-2),
            created: row.created,
            user_id: row.user_id,
          }
          return date;
        });
        this.dates = disabled;
      });
    },
  },
}
</script>

<style>
  .disabled {
    width: 100%;
    height: 100%;
    background-color: rgba(205, 92, 92, 0.7);
  }
</style>
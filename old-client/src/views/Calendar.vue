<template>
  <section>
    <h1>Calendar</h1>
    <section class="row mt-3">
      <div class="col-4" v-for="date in dates" :key="date._id">
        <div class="card border-info mb-3" style="max-width: 20rem;">
          <div class="card-header">{{date.title}}</div>
          <div class="card-body">
            <p class="card-text" v-html="renderMarkDown(date.desc)"></p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>
<script>
import MarkdownIt from 'markdown-it';
import MDemoji from 'markdown-it-emoji';


const md = MarkdownIt();
md.use(MDemoji);

const API_URL = process.env.VUE_APP_API_URL;
export default {
  data: () => ({
    user: null,
    dates: [],
  }),
  mounted(){
    fetch(API_URL, {
      headers: {
        authorization: `Bearer ${localStorage.token}`,
      }
    }).then(res => res.json())
    .then((result) => {
      console.log(result);
      if(result.user) {
        this.user = result.user;
        this.getDates();
      }else {
        this.logout();
      }
    });
  },
  methods: {
    renderMarkDown(date) {
      return md.render(date);
    },
    getDates() {
      fetch(`${API_URL}api/v1/calendars`, {
        headers: {
          authorization: `Bearer ${localStorage.token}`,
        }
      }).then(res => res.json())
      .then(dates => {
        this.dates = dates;
      });
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
};
</script>

<style>

</style>
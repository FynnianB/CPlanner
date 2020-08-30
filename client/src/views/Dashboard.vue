<template>
  <section>
    <h1>Dashboard</h1>
    <h1 v-if="!user">Getting user information...</h1>
    <h1 v-if="user">Hello, {{user.username}}!</h1>
    <button @click="logout()" class="btn btn-primary">Logout</button>
    <br>
    <br>
    <button @click="showForm = !showForm" class="btn btn-info">Toggle Form</button>
    <br>
    <br>
    <form v-if="showForm" @submit.prevent="addNote()">
      <div class="form-group">
        <label for="title">Title</label>
        <input v-model="newNote.title" type="text" class="form-control" id="title" aria-describedby="titleHelp" placeholder="Enter a title" required>
        <small id="titleHelp" class="form-text text-muted">
          Enter your descriptive title for your note.
        </small>
      </div>
      <div class="form-group">
        <label for="note">Note</label>
        <textarea v-model="newNote.note" class="form-control" id="note" placeholder="Enter a note" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn-success">Add Note</button>
    </form>
    <section class="row mt-3">
      <div class="col-4" v-for="note in notes" :key="note._id">
        <div class="card border-info mb-3" style="max-width: 20rem;">
          <div class="card-header">{{note.title}}</div>
          <div class="card-body">
            <p class="card-text" v-html="renderMarkDown(note.note)"></p>
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

const API_URL = 'https://app.fynnian-brosius.de/';
export default {
  data: () => ({
    showForm: false,
    user: null,
    newNote: {
      title: '',
      note: '',
    },
    notes: [],
  }),
  mounted(){
    fetch(API_URL, {
      headers: {
        authorization: `Bearer ${localStorage.token}`,
      }
    }).then(res => res.json())
    .then((result) => {
      if(result.user) {
        this.user = result.user;
        this.getNotes();
      }else {
        this.logout();
      }
    });
  },
  methods: {
    renderMarkDown(note) {
      return md.render(note);
    },
    getNotes() {
      fetch(`${API_URL}api/v1/notes`, {
        headers: {
          authorization: `Bearer ${localStorage.token}`,
        }
      }).then(res => res.json())
      .then(notes => {
        this.notes = notes;
      });
    },
    addNote() {
      fetch(`${API_URL}api/v1/notes`, {
        method: 'POST',
        body: JSON.stringify(this.newNote),
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${localStorage.token}`,
        },
      }).then(res => res.json())
      .then((note) => {
        this.notes.push(note);
        this.newNote = {
          title: '',
          note: '',
        };
        this.showForm = false;
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
.card-text img {
  width: 100%;
}
</style>
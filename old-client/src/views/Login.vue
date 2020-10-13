<template>
  <section>
    <h1>Login</h1>
    <div class="m-auto" style="width:10vh;">
      <img v-if="loggingIn" src="../assets/loading-icon.svg"
       class="text-center h-100" style="margin-left:-50%"/>
    </div>
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
    <form v-if="!loggingIn" @submit.prevent="login">
      <div class="form-group">
        <label for="username">Username</label>
        <input
        v-model="user.username"
        type="text"
        class="form-control"
        id="username"
        aria-describedby="usernameHelp"
        placeholder="Enter a username" required>
        <small id="usernameHelp" class="form-text text-muted">
          Enter your username to login.
        </small>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
        v-model="user.password"
        type="password"
        class="form-control"
        id="password"
        aria-describedby="passwordHelp"
        placeholder="Enter a password" required>
        <small id="passwordHelp" class="form-text text-muted">
          Enter your password to login.
        </small>
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </section>
</template>

<script>
import Joi from 'joi';

const LOGIN_URL = process.env.VUE_APP_API_URL+'auth/login';

const schema = Joi.object({
  username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]+$')).min(5).max(30)
    .required(),
  password: Joi.string().trim().pattern(new RegExp('^\\S*$'))
    .pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$'))
    .required(),
});

export default {
  data: () => ({
    loggingIn: false,
    errorMessage: '',
    user: {
      username: '',
      password: '',
    },
  }),
  watch: {
    user: {
      handler() {
        this.errorMessage = '';
      },
      deep: true,
    },
  },
  methods: {
    login() {
      this.errorMessage = '';
      if (this.validUser()) {
        const body = {
          username: this.user.username,
          password: this.user.password,
        };
        this.loggingIn = true;
        fetch(LOGIN_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(body),
        }).then((res) => {
          if (res.ok) {
            return res.json();
          }
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        }).then((res) => {
          localStorage.token = res.token;
          setTimeout(() => {
            this.loggingIn = false;
            this.$router.push('/dashboard');
          }, 200);
        }).catch((err) => {
          setTimeout(() => {
            this.loggingIn = false;
            this.errorMessage = err.message;
          }, 200);
        });
      }
    },
    validUser() {
      const result = schema.validate({
        username: this.user.username,
        password: this.user.password,
      });
      if (result.error === undefined) {
        return true;
      }
      if (result.error.message.includes('username')) {
        this.errorMessage = 'Invalid Username!';
      } else {
        this.errorMessage = 'Invalid Password!';
      }
      return false;
    },
  },
};
</script>

<style>
</style>

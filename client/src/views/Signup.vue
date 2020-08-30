<template>
  <section>
    <h1>Sign Up</h1>
    <div class="m-auto" style="width:10vh;">
      <img v-if="signingUp" src="../assets/loading-icon.svg"
       class="text-center h-100" style="margin-left:-50%"/>
    </div>
    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
    </div>
    <form v-if="!signingUp" @submit.prevent="signup">
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
          Must at least 6 characters.
          Can only contain: alphanumeric characters, _, -.
        </small>
      </div>
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="password">Password</label>
          <input
          v-model="user.password"
          type="password"
          class="form-control"
          id="password"
          aria-describedby="passwordHelp"
          placeholder="Enter a password" required>
          <small id="passwordHelp" class="form-text text-muted">
            Must at least 8 Chars.
            Must contain: 1+ Uppercase, 1+ Lowercase, 1+ Number
          </small>
        </div>
        <div class="form-group col-md-6">
          <label for="confirmPassword">Confirm Password</label>
          <input
          v-model="user.confirmPassword"
          type="password"
          class="form-control"
          id="confirmPassword"
          aria-describedby="confirmPasswordHelp"
          placeholder="Enter a password" required>
          <small id="confirmPasswordHelp" class="form-text text-muted">
            Confirm your password
          </small>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Signup</button>
    </form>
  </section>
</template>
<script>
import Joi from 'joi';

const SIGNUP_URL = 'https://app.fynnian-brosius.de/auth/signup';
const schema = Joi.object({
  username: Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]+$')).min(5).max(30)
    .required(),
  password: Joi.string().trim().pattern(new RegExp('^\\S*$'))
    .pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$'))
    .required(),
  confirmPassword: Joi.string().trim().pattern(new RegExp('^\\S*$'))
    .pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$'))
    .required(),
});
export default {
  data: () => ({
    signingUp: false,
    errorMessage: '',
    user: {
      username: '',
      password: '',
      confirmPassword: '',
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
    signup() {
      this.errorMessage = '';
      if (this.validUser()) {
        const body = {
          username: this.user.username,
          password: this.user.password,
        };
        this.signingUp = true;
        fetch(SIGNUP_URL, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res.ok) {
            return res.json();
          }
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        }).then((result) => {
          localStorage.token = result.token;
          setTimeout(() => {
            this.signingUp = false;
            this.$router.push('/dashboard');
          }, 500);
        }).catch((err) => {
          setTimeout(() => {
            this.signingUp = false;
            this.errorMessage = err.message;
          }, 500);
        });
      }
    },
    validUser() {
      if (this.user.password !== this.user.confirmPassword) {
        this.errorMessage = 'Passwords must match';
        return false;
      }
      const result = schema.validate({
        username: this.user.username,
        password: this.user.password,
        confirmPassword: this.user.confirmPassword,
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

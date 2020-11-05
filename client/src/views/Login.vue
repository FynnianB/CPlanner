<template>
  <v-app>
    {{API_URL}}
    <v-main>
      <v-container class="fill-height d-flex justify-center">
        <div class="align-center">
          <h1 class="text-center mb-5">CPlanner</h1>
          <v-card
            ref="form"
            elevation="3"
            width="500px"
            outlined
            :loading="loading"
          >
            <v-tabs v-model="tab" fixed-tabs @change="resetForms()">
              <v-tab key="login">Login</v-tab>
              <v-tab key="register">Register</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item key="login">
                <v-card-text>
                  <v-container>
                    <v-alert
                      outlined
                      text
                      tile
                      type="error"
                      v-model="alertBox.enabled"
                    >{{alertBox.context}}</v-alert>
                    <v-text-field
                      v-model="loginUser.username"
                      label="Username"
                      required
                    ></v-text-field>
                    <v-text-field
                      v-model="loginUser.password"
                      label="Password"
                      required
                      :append-icon="showLoginPass ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showLoginPass ? 'text' : 'password'"
                      @click:append="showLoginPass = !showLoginPass"
                    ></v-text-field>
                    <v-checkbox
                      v-model="loginUser.rememberMe"
                      label="Remember me"
                    ></v-checkbox>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="login()"
                  >Login</v-btn>
                </v-card-actions>
              </v-tab-item>
              <v-tab-item key="register">
                <v-card-text>
                  <v-container>
                    <v-alert
                      outlined
                      text
                      tile
                      type="error"
                      v-model="alertBox.enabled"
                    >{{alertBox.context}}</v-alert>
                    <v-text-field
                      v-model="registerUser.username"
                      label="Username"
                      counter="30"
                      required
                      :error-messages="registerUsernameErrors"
                    ></v-text-field>
                    <v-text-field
                      v-model="registerUser.password"
                      label="Password"
                      counter="30"
                      required
                      :append-icon="showRegisterPass ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showRegisterPass ? 'text' : 'password'"
                      @click:append="showRegisterPass = !showRegisterPass"
                      :error-messages="registerPasswordErrors"
                    ></v-text-field>
                    <v-text-field
                      v-model="registerUser.confirmPassword"
                      label="Confirm password"
                      required
                      :append-icon="showRegisterConfirmPass ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showRegisterConfirmPass ? 'text' : 'password'"
                      @click:append="showRegisterConfirmPass = !showRegisterConfirmPass"
                      :error-messages="registerConfirmPasswordErrors"
                    ></v-text-field>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    @click="register()"
                  >Register</v-btn>
                </v-card-actions>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, maxLength, minLength } from 'vuelidate/lib/validators'

const matchRegExp = (exp) => (value) => new RegExp(exp).test(value)

function matchWithPassword(value) {
  return this.registerUser.password === value
}

export default {
  mixins: [validationMixin],
  validations: {
    loginUser: {
      username: {
        required,
        maxLength: maxLength(30),
        minLength: minLength(5),
        matchRegExp: matchRegExp('^[a-zA-Z0-9_-]+$')
      },
      password:{
        required,
        maxLength: maxLength(30),
        minLength: minLength(8),
        matchRegExp1: matchRegExp('^\\S*$'),
        matchRegExp2: matchRegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$')
      },
    },
    registerUser: {
      username: {
        required,
        maxLength: maxLength(30),
        minLength: minLength(5),
        matchRegExp: matchRegExp('^[a-zA-Z0-9_-]+$')
      },
      password:{
        required,
        maxLength: maxLength(30),
        minLength: minLength(8),
        matchRegExp1: matchRegExp('^\\S*$'),
        matchRegExp2: matchRegExp('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,30}$')
      },
      confirmPassword: {
        required,
        matchWithPassword
      }
    },
  },
  data: () => ({
    API_URL: process.env.VUE_APP_API_URL,
    loginUser: {
      username: '',
      password: '',
      rememberMe: true,
    },
    registerUser: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    tab: null,
    loading: false,
    showLoginPass: false,
    showRegisterPass: false,
    showRegisterConfirmPass: false,
    alertBox: {
      enabled: false,
      context: '',
    },
  }),
  computed: {
    registerUsernameErrors () {
      const errors = []
      if (!this.$v.registerUser.username.$dirty) return errors
      !this.$v.registerUser.username.maxLength && errors.push('Der Benutzername darf maximal 30 Zeichen lang sein')
      !this.$v.registerUser.username.minLength && errors.push('Der Benutzername muss mindestens 5 Zeichen lang sein')
      !this.$v.registerUser.username.required && errors.push('Der Benutzername ist erforderlich')
      !this.$v.registerUser.username.matchRegExp && errors.push('Der Benutzername darf nur Buchstaben, Zahlen, Unter- und Bindestriche enthalten')
      return errors
    },
    registerPasswordErrors () {
      const errors = []
      if (!this.$v.registerUser.password.$dirty) return errors
      !this.$v.registerUser.password.maxLength && errors.push('Das Passwort darf 30 Zeichen lang sein')
      !this.$v.registerUser.password.minLength && errors.push('Das Passwort muss mindestens 8 Zeichen lang sein')
      !this.$v.registerUser.password.required && errors.push('Das Passwort ist erforderlich')
      !this.$v.registerUser.password.matchRegExp1 && errors.push('Das Passwort darf keine Leerzeichen erhalten')
      !this.$v.registerUser.password.matchRegExp2 && errors.push('Das Passwort muss min. 1 Groß- und 1 Kleinbuchstabe sowie 1 Ziffer enthalten')
      return errors
    },
    registerConfirmPasswordErrors () {
      const errors = []
      if (!this.$v.registerUser.confirmPassword.$dirty) return errors
      !this.$v.registerUser.confirmPassword.required && errors.push('Die Wiederholung ist erforderlich')
      !this.$v.registerUser.confirmPassword.matchWithPassword && errors.push('Das Passwort muss mit dem Vorherigen übereinstimmen')
      return errors
    },
  },
  methods: {
    login() {
      console.log(process.env.VUE_APP_API_URL);
      this.$v.loginUser.$touch()
      this.alertBox.enabled = false
      if (this.$v.loginUser.$invalid) {
        this.alertBox.context = 'Username or password invalid!'
        this.alertBox.enabled = true
      } else {
        const body = {
          username: this.loginUser.username,
          password: this.loginUser.password,
        };
        this.loading = true;
        fetch(process.env.VUE_APP_API_URL+'auth/login', {
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
            var errorMsg = err.message
            if (errorMsg === 'Unable to login!') {
              errorMsg = 'Username or password invalid!'
            }
            throw new Error(errorMsg);
          });
        }).then((res) => {
          localStorage.token = res.token;
          this.loading = false;
          this.$router.push('/dashboard');
        }).catch((err) => {
          this.loading = false;
          this.alertBox.context = err.message
          this.alertBox.enabled = true
        });
      }
    },
    register() {
      this.$v.registerUser.$touch()
      if (!this.$v.registerUser.$invalid) {
        const body = {
          username: this.registerUser.username,
          password: this.registerUser.password,
        };
        this.loading = true;
        fetch(process.env.VUE_APP_API_URL+'auth/signup', {
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
        }).then((result) => {
          localStorage.token = result.token;
          this.loading = false;
          this.$router.push('/dashboard');
        }).catch((err) => {
          this.loading = false;
          this.alertBox.context = err.message
          this.alertBox.enabled = true
        });
      }
    },
    resetForms() {
      this.$v.loginUser.$reset()
      this.$v.registerUser.$reset()
      this.loginUser = {
        username: '',
        password: '',
        rememberMe: true,
      }
      this.registerUser = {
        username: '',
        password: '',
        confirmPassword: '',
      }
      this.alertBox = {
        enabled: false,
        context: '',
      }
    },
  },
};
</script>
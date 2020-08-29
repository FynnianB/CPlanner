<template>
  <div class="home text-center">
    <div class="jumbotron">
      <h1 class="display-3">CPlanner</h1>
      <p class="lead">Combine your Planner!</p>
      <hr class="my-4" />
      <p>You want to combine your planner with the other ones. Then CPlanner is YOUR CHOISE!</p>
      <p class="lead">
        <router-link class="btn btn-primary btn-lg" :to="{ name: 'signup' }" role="button">Sign Up</router-link>
        <router-link class="btn btn-info btn-lg btn-login" :to="{ name: 'login' }" role="button">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {

};
</script>
<style>
.btn-login {
  margin-left: 1rem;
}
</style>

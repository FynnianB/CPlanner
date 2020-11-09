<template>
  <v-app>
    <v-main>
      <TestComponent />
    </v-main>
  </v-app>
</template>

<script>
import TestComponent from '@/components/TestComponent';

export default {
  name: 'Test',

  components: {
    TestComponent,
  },

  data: () => ({
    //
  }),
};
</script>

<template>
  DoctorHome.vue

  <!-- ! SENDING HELP OVERLAY -->
  <v-overlay class="align-end justify-center" v-model="helpNeeded">
    <v-card class="px-4 py-3 ma-2 rounded-xl card">
      <v-card-title class="text-h5 mb-6 text-center font-weight-regular">
        Človek v núdzi
      </v-card-title>
      <v-card-text class="text-center"
        >Vo vašej blízkosti sa nachádza človek, ktorý potrebuje vašu pomoc.
        Kliknutím na tlačidlo sa otvorí navigácia.</v-card-text
      >
      <v-card-actions class="align-center justify-center flex-column">
        <v-btn
          block
          variant="flat"
          color="error"
          size="x-large"
          @click="$router.push('/doctormap')"
          class="mb-3 navigatebutton rounded-lg font-weight-regular"
          >Navigovať</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>
<script setup></script>
<script></script>
<script>
import { socket, emergency } from "@/socket";
import { watch } from "vue";

export default {
  name: "DoctorHome",
  data: () => ({
    helpNeeded: false,
    interval: null
  }),
  methods: {
    getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    },
  },
  mounted() {
    watch(emergency, (emergency) => {
      this.helpNeeded = !!emergency.id;
    });

    this.interval = setInterval(() => {
      this.getLocation((position) => {
        const location = [position.coords.latitude + 0.001, position.coords.longitude];

        socket.emit("doctor-receive", location, '20 rokov praxe');
      });
    }, 1000);
  },
  unmounted() {
    clearInterval(this.interval);
  }
};
</script>
<style lang="scss">
.card {
  width: 23.5rem;
}
.navigatebutton {
  text-transform: none !important;
  font-size: 0.8rem;
  letter-spacing: 1px !important;
}
</style>

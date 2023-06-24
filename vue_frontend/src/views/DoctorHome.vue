<template>
  <!-- ! SENDING HELP OVERLAY -->
  <v-overlay class="align-end justify-center" v-model="helpNeeded" @click:outside="onOverlay">
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
import { socket, emergency, rejectedEmergencies } from "@/socket";
import { watch } from "vue";

export default {
  name: "DoctorHome",
  data: () => ({
    helpNeeded: true,
    interval: null,
  }),
  methods: {
    getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    },
    onOverlay(value) {
      console.log('overlay off');
      
      rejectedEmergencies.push(emergency.id);
      emergency.id = null;
      emergency.location = null;
      emergency.doctor = null;
    }
  },
  mounted() {
    watch(emergency, (emergency) => {
      this.helpNeeded = !!emergency.id;
    });

    const interval = () => {
      this.getLocation((position) => {
        const location = [
          position.coords.latitude + 0.001,
          position.coords.longitude,
        ];

        socket.emit("doctor-receive", location, "20 rokov praxe");
      });
    };

    interval();
    this.interval = setInterval(interval(), 1000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
};
</script>
<style lang="scss">
.card {
  width: 22rem;
}
.navigatebutton {
  text-transform: none !important;
  font-size: 0.8rem;
  letter-spacing: 1px !important;
}
</style>

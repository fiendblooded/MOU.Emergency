<template>
  <div id="map"></div>

  <!-- ! CANCEL BUTTON -->
  <v-btn
    v-if="!doctorArrived"
    @click="overlay2 = !overlay2"
    color="error"
    class="btna"
    size="x-large"
    rounded="xl"
    >Zrušiť volanie</v-btn
  >

  <!-- ! CANCEL CONFIRM OVERLAY -->
  <v-overlay class="align-center justify-center" v-model="overlay2">
    <v-card class="pa-3 rounded-lg">
      <v-card-title class="text-h6 mb-6">
        Naozaj chcete zrušiť volanie?
      </v-card-title>
      <v-card-actions class="align-center justify-center flex-column">
        <v-btn
          block
          variant="flat"
          color="error"
          size="large"
          @click="cancelEmergency"
          class="mb-3 confirmbutton rounded-lg"
          >Zrušiť volanie</v-btn
        >
        <v-btn
          block
          class="confirmbutton rounded-lg"
          variant="tonal"
          size="large"
          @click="continueEmergency"
          >Pokračovať vo volaní</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-overlay>

  <!-- ! WHO ARE YOU CALLING TO HELP OVERLAY -->
  <v-overlay
    class="align-center justify-center"
    v-model="overlay1"
    @click:outside="onReject"
  >
    <v-card class="pa-3 rounded-lg">
      <v-card-title class="text-h6 mb-6"> Pre koho voláte pomoc? </v-card-title>
      <v-card-actions class="align-center justify-center flex-column">
        <v-btn
          block
          variant="flat"
          color="error"
          size="large"
          @click="forMyself"
          class="mb-3 confirmbutton rounded-lg"
          >Seba</v-btn
        >
        <v-btn
          block
          class="confirmbutton rounded-lg"
          variant="tonal"
          size="large"
          @click="forSomeoneElse"
          >Niekoho iného</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-overlay>

  <!-- ! SUCCESS!!! OVERLAY -->
  <v-overlay class="align-center justify-center" v-model="doctorArrived">
    <v-card class="pa-2 ma-2 rounded-lg">
      <v-card-title class="text-h5 mb-6 text-center">
        Pomoc dorazila</v-card-title
      >
      <v-card-text class="flexit text-center justify-center align-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
          color="green"
          width="40%"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>

        Vo vašej blízkosti sa nachádza lekárnik. Čakajte na mieste.
      </v-card-text>
      <v-card-actions class="align-center justify-center flex-column">
        <v-btn
          block
          class="confirmbutton rounded-lg"
          variant="tonal"
          size="large"
          @click="this.$router.push('/')"
          >Späť do aplikácie MOU</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-overlay>
</template>
<script setup>
import { socket } from "@/socket";
import mapboxgl from "mapbox-gl";
import { v4 } from "uuid";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
// const mapboxgl = require("mapbox-gl");
// import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

const location = [27.131651288219417, 48.1520380051274];

export default {
  name: "Map",
  data: () => ({
    overlay1: true,
    overlay2: false,
    doctorArrived: false,
    marker: null,
    map: null,
    interval: null,
  }),
  methods: {
    forMyself() {
      this.emergency({
        gender: "Muž",
        allergens: ["peľ", "prach"],
        chronicIllnesses: ["astma"],
        bloodType: "AB+",
        vaccinations: ["COVID-19", "chrípka"],
        medications: ["inzulín"],
        isDiabetic: true,
        familyMembersChronicIllnesses: [],
      });
    },
    onReject() {
      this.$router.push("/");
    },
    forSomeoneElse() {
      this.emergency({});
    },
    getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    },
    setPulse([lat, lng], instant) {
      this.marker.setLngLat([lng, lat]);

      this.map[instant ? "jumpTo" : "flyTo"]({
        center: [lng, lat],
        zoom: 17,
      });
    },
    emergency(medicalData) {
      this.overlay1 = false;

      const id = v4();

      const startTime = performance.now();

      const interval = () => {
        this.getLocation((position) => {
          const latLng = [position.coords.latitude, position.coords.longitude];

          this.setPulse(latLng, true);

          socket.emit("emergency", id, latLng, medicalData);
        });
      };

      interval();
      this.interval = setInterval(interval, 300);
      

      socket.on("doctor-arrived", (message) => {
        if (message) console.log(message);
        this.doctorArrived = true;
        clearInterval(this.interval);
      });
    },
    cancelEmergency() {
      socket.emit("cancel-emergency");
      this.$router.push("/");
    },
    continueEmergency() {
      this.overlay2 = !this.overlay2;
    },
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";
    this.map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: location, // starting position [lng, lat]
      zoom: 17, // starting zoom
    });
    this.map.scrollZoom.disable();
    //Add markers to the map

    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [27.131651288219417, 48.1520380051274],
          },
        },
      ],
    };

    for (const feature of geojson.features) {
      const el = document.createElement("div");
      for (let i = 0; i < 3; i++) {
        let pulse = document.createElement("div");
        pulse.className = "pulse";

        pulse.classList.add(`pulse-${i}`);
        pulse.style.animationDelay = i * 0.6 + "s";
        el.appendChild(pulse);
      }

      el.className = "marker";
      el.style.backgroundSize = "100%";

      console.log(feature.geometry.coordinates);

      this.marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(this.map);
    }

    this.getLocation((position) => {
      this.setPulse(
        [position.coords.latitude, position.coords.longitude],
        true
      );
    });
  },
  unmounted() {
    socket.off("doctor-arrived");
    clearInterval(this.interval);
  },
};
</script>
<style lang="scss">
#map {
  width: 100%;
  height: calc(100% + 2rem);
}

.flexit {
  display: flex;
  flex-direction: column;

  svg {
    margin-bottom: 3rem;
  }
  padding: 2rem !important;
}

.btna {
  position: absolute !important;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  font-weight: 400;
  text-transform: none !important;
}

.confirmbutton {
  text-transform: none !important;
}

.marker {
  display: block;
  border: none;
  border-radius: 50%;
  padding: 0;
  width: 1.5rem;
  aspect-ratio: 1;
  background-color: #c3112b;
  position: relative;
  z-index: 10;
  transform-style: preserve-3d;
}

.pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateZ(-1px) translate(-50%, -50%);
  background-color: #c3112b;
  aspect-ratio: 1;

  border-radius: 50%;
  animation: scaleIn 3s infinite ease;
  image-rendering: smooth;
}

@keyframes scaleIn {
  from {
    width: 1.4rem;
    opacity: 0.5;
  }
  to {
    width: 20rem;
    opacity: 0;
  }
}
</style>

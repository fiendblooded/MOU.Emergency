<template>
  <div id="map"></div>

  <v-btn
    @click="overlay2 = !overlay2"
    color="error"
    class="btna"
    size="x-large"
    rounded="xl"
    >Zrušiť volanie</v-btn
  >

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

  <v-overlay class="align-center justify-center" v-model="overlay1">
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
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { io } from "socket.io-client";
</script>
<script>
// const mapboxgl = require("mapbox-gl");
// import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

let location = [27.131651288219417, 48.1520380051274];

export default {
  name: "Map",
  data: () => ({
    overlay1: true,
    overlay2: false,
  }),
  methods: {
    forMyself() {},
    forSomeoneElse() {},
    cancelEmergency() {
      this.$router.push("/");
    },
    continueEmergency() {
      this.overlay2 = !this.overlay2;
    },
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: location, // starting position [lng, lat]
      zoom: 17, // starting zoom
    });
    map.scrollZoom.disable();
    //Add markers to the map

    const socket = io("http://martinusius.sk:1337");

    function getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    }

    socket.on("connect", () => {
      getLocation((position) => {
        const geojson = {
          type: "FeatureCollection",

          features: [
            {
              type: "Feature",
              properties: { message: "Foo", iconSize: [60, 60] },
              geometry: {
                type: "Point",
                coordinates: [
                  position.coords.longitude,
                  position.coords.latitude,
                ],
              },
            },
          ],
        };

        for (const marker of geojson.features) {
          const el = document.createElement("div");
          for (let i = 0; i < 3; i++) {
            let pulse = document.createElement("div");
            pulse.className = "pulse";

            pulse.classList.add(`pulse-${i}`);
            pulse.style.animationDelay = i * 0.6 + "s";
            el.appendChild(pulse);
          }
          // const width = marker.properties.iconSize[0];
          // const height = marker.properties.iconSize[1];
          el.className = "marker";
          // el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
          // el.style.width = `${width}px`;
          // el.style.height = `${height}px`;
          el.style.backgroundSize = "100%";

          // Add markers to the map.
          new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
        }

        map.flyTo({
          center: geojson.features[0].geometry.coordinates,
        });

        socket.emit("emergency", location.reverse());
      });
    });

    socket.on("no-doctors", () => {
      alert("No doctors available");
    });
  },
};
</script>
<style lang="scss">
#map {
  width: 100%;
  height: calc(100% + 2rem);
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

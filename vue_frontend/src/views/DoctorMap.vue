<template>
  <div id="map"></div>
  <div class="overlay">
    <v-card
      class="rounded-xl px-0 py-4 flex-column justify-center align-center contentcard"
    >
      <button class="up" @click="hore">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>
      <v-card-title class="text-center mb-3">Lekársky záznam</v-card-title>
      <v-card-text class="px-3">
        <v-list>
          <v-list-item v-for="item in medicalInfo" class="flex-list px-2">
            <span class="title">{{ item.title }}</span
            ><span class="val">{{ item.value }}</span>
          </v-list-item>
        </v-list>
        <v-expansion-panels class="ma-0 pa-0 nosh" variant="accordion">
          <v-expansion-panel v-for="panel in expansionPanels" class="nosh">
            <v-expansion-panel-title class="px-2 nosh title">{{
              panel.title
            }}</v-expansion-panel-title>
            <v-expansion-panel-text class="text-center">
              <!-- FOR LOOP -->
              <span class="text-bold">{{ panel.content.join(", ") }}</span>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </div>
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
import { watch } from "vue";
import { emergency, socket } from "@/socket";

export default {
  name: "DoctorMap",
  data: () => ({
    interval: null,
    map: null,
    start: false,
    marker: null,
    bottomsheet: true,
    medicalInfo: [
      { title: "Pohlavie", value: "Muž" },
      { title: "Pohlavie", value: "Muž" },
      { title: "Pohlavie", value: "Muž" },
    ],
    expansionPanels: [
      { title: "Alergény", content: ["Penicilín", "Prachy"] },
      { title: "lol", content: "lorem" },
      { title: "lol", content: "lorem" },
      { title: "lol", content: [] },
    ],
  }),
  methods: {
    getLocation(callback) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(callback);
      } else {
        console.log("Geolocation is not supported by this browser.");
      }
    },
    setStartPoint([lat, lng]) {
      if(!this.start) {
        this.map.jumpTo({
          center: [lng, lat],
          zoom: 17,
        });
        this.start = true;
      }
      else {
        this.map.flyTo({
          center: [lng, lat],
          zoom: 17,
        });
      }

      const point = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        ],
      };

      if(this.map.getLayer('point')) {
        this.map.getSource('point').setData(point);
        return;
      }

      this.map.addLayer({
        id: "point",
        type: "circle",
        source: {
          type: "geojson",
          data: point,
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "#3887be",
        },
      });
    },
    hore() {
      document.querySelector(".overlay").classList.toggle("idemhore");
    },
    setEndPoint([lat, lng]) {
      const end = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
        ],
      };

      for (const element of end.features) {
        if(this.marker) {
          this.marker.setLngLat(element.geometry.coordinates);
          return;
        }
        
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

        this.marker = new mapboxgl.Marker(el)
          .setLngLat(element.geometry.coordinates)
          .addTo(this.map);
      }
    },
    displayRoute(coordinates) {
      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      };

      if (this.map.getSource("route")) {
          this.map.getSource("route").setData(geojson);
      }
      else {
        this.map.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }
    },
    async getRoute(from, to) {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${from[1]},${from[0]};${to[1]},${to[0]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: "GET" }
      );

      const json = await query.json();
      const data = json.routes[0];
      return data.geometry.coordinates;
    }
  },
  mounted() {
    if(!emergency.id) {
      this.$router.push('/doctor');
      return;
    }

    watch(emergency, (emergency) => {
      if(emergency.location) this.setEndPoint(emergency.location);
      if(emergency.id === null) this.$router.push('/doctor');
    });
    


    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";

    this.map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [emergency.location[0], emergency.location[1]], // starting position [lng, lat]
      zoom: 17, // starting zoom
    });

    function lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    function lerp2(a, b, t) {
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }

    this.setEndPoint(emergency.location);

    const startTime = performance.now();

    const interval = () => {
      this.getLocation(async (position) => {
        const start = lerp2(
          [position.coords.latitude + 0.001, position.coords.longitude], 
          emergency.location, 
          Math.min(1, (performance.now() - startTime) / 1000 * 0.1)
        );

        socket.emit('doctor-pursuit', emergency.id, start);

        const coordinates = await this.getRoute(start, emergency.location);
        this.setStartPoint(start);
        this.displayRoute(coordinates);
      });
    }

    interval();
    this.interval = setInterval(interval, 1000);

    socket.on('patient-reached', () => {
      emergency.id = null;
      emergency.location = null;
      emergency.medicalData = null;

      alert('Patient reached!')

      this.$router.push('/doctor');
    });
  },
  unmounted() {
    socket.off('patient-reached');
    clearInterval(this.interval);
  },
};
</script>
<style lang="scss">
#map {
  width: 100%;
  height: calc(100% + 2rem);
}

.idemhore {
  transform: translate(-50%, 10%) !important;
}

.contentcard {
  height: 70vh;
}

.text-bold {
  font-weight: 500;
  text-align: center;
}

.v-list-item__content {
  display: flex !important;
  flex-direction: row;
  align-items: center;
  justify-content: space-between !important;
}

.title {
  color: rgb(70, 70, 70);
  font-weight: 500;
}

.val {
  font-weight: 600;
}

.nosh {
  box-shadow: none !important;
}

.up {
  width: 1.6rem;
  display: block !important;
  width: 100%;
  height: 1.6rem;
  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
}
.overlay {
  position: fixed;
  left: 50%;
  transform: translate(-50%, 90%);
  bottom: 5%;
  width: calc(100% - 1rem);
  transition: all 0.4s ease-in;
  z-index: 1000000000;
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

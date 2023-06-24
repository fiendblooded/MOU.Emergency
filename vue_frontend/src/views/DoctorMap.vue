<template>
  <div id="map"></div>
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
import { emergency, socket } from "@/socket";

export default {
  name: "DoctorMap",
  data: () => ({
    interval: null,
    map: null,
    start: false,
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
    initEndPoint([lat, lng]) {
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
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${from[1]},${from[0]};${to[1]},${to[0]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        { method: "GET" }
      );

      const json = await query.json();
      const data = json.routes[0];
      return data.geometry.coordinates;
    }
  },
  mounted() {
    console.log("Emergency:", JSON.parse(JSON.stringify(emergency)));

    if(emergency.id === null) {
      this.$router.push('/doctor');
      return;
    }

    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";

    this.map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: [emergency.location[0], emergency.location[1]], // starting position [lng, lat]
      zoom: 17, // starting zoom
    });

    //this.map.scrollZoom.disable();

    function lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    function lerp2(a, b, t) {
      return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
    }

    this.map.on("load", () => {
      this.initEndPoint(emergency.location);

      const startTime = performance.now();

      this.interval = setInterval(() => {
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
      }, 1000);
    });

    socket.on('patient-reached', () => {
      alert('Patient reached!');
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

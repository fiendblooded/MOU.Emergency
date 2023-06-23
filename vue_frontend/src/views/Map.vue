<template>
  <div id="map"></div>
  <v-btn color="error" class="btn" size="x-large" rounded="xl"
    >Zrušiť volanie</v-btn
  >
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
// const mapboxgl = require("mapbox-gl");
// import mapboxgl from "mapbox-gl"; // or "const mapboxgl = require('mapbox-gl');"

let location = [17.131651288219417, 48.1520380051274];
const geojson = {
  type: "FeatureCollection",

  features: [
    {
      type: "Feature",
      properties: { message: "Foo", iconSize: [60, 60] },
      geometry: { type: "Point", coordinates: location },
    },
  ],
};

export default {
  name: "Map",
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
    for (const marker of geojson.features) {
      const el = document.createElement("div");
      for (let i = 0; i < 3; i++) {
        let pulse = document.createElement("div");
        pulse.className = "pulse";

        pulse.classList.add(`pulse-${i}`);
        pulse.style.animationDelay = i * 0.6 + "s";
        el.appendChild(pulse);
      }
      const width = marker.properties.iconSize[0];
      const height = marker.properties.iconSize[1];
      el.className = "marker";
      // el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
      // el.style.width = `${width}px`;
      // el.style.height = `${height}px`;
      el.style.backgroundSize = "100%";

      // Add markers to the map.
      new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map);
    }
  },
};
</script>
<style lang="scss">
#map {
  width: 100%;
  height: calc(100% + 2rem);
}

.btn {
  position: fixed;
  bottom: 6.4rem;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  font-weight: 400;
  text-transform: none;
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

<template>
  <div id="map"></div>
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
let myLocation;
let targetLocation;

export default {
  name: "DoctorMap",
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";

    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: myLocation, // starting position [lng, lat]
      zoom: 17, // starting zoom
    });

    map.scrollZoom.disable();
  },
};
</script>
<style lang="scss"></style>

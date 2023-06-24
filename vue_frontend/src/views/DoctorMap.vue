<template>
  <div id="map"></div>
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
import { emergency } from "@/socket";

//Get this from GPS
let start = [-122.66078118064226, 45.51413559638103];

//Get this from server
let targetLocation = [-122.679565, 45.495273];

async function getRoute(end) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );

  const json = await query.json();
  console.log(json);

  const data = json.routes[0];
  const route = data.geometry.coordinates;
  return route;
}

export default {
  name: "DoctorMap",

  mounted() {
    console.log("Emergency:", JSON.parse(JSON.stringify(emergency)));

    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";

    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: start, // starting position [lng, lat]
      zoom: 17, // starting zoom
    });
    console.log(map);

    map.scrollZoom.disable();

    //Call the directions API
    map.on("load", () => {
      console.log("sme tu");
      // make an initial directions request that
      // starts and ends at the same location
      getRoute(start);
      map.addLayer({
        id: "point",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates: start,
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "#3887be",
        },
      });
      // console.log(map.addLayer());
      // Add starting point to the map
    });
    // reset if already exists, make a new request if it doesn't

    //Make the initial call

    map.on("click", async (event) => {
      console.log("click");

      const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);

      const coordinates = await getRoute(coords);

      const geojson = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
      };
      console.log(coordinates);

      const end = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: coords,
            },
          },
        ],
      };

      if (map.getLayer("end")) {
        console.log("updating point");
        map.getSource("end").setData(end);
      } else {
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
            .addTo(map);
        }

        //! Route generation
        if (map.getSource("route")) {
          console.log("Route already exists on the map");
          map.getSource("route").setData(geojson);
        } else {
          console.log("creating new route");
          console.log(map);
          map.addLayer({
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
      }
    });
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

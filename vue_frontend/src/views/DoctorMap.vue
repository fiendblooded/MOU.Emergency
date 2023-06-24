<template>
  <div id="map"></div>
</template>
<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
</script>
<script>
//Get this from GPS
let start = [-123.160603, 45.396573];

//Get this from server
let targetLocation = [-123.169003, 45.495273];

async function getRoute(end) {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: "GET" }
  );

  const json = await query.json();
  const data = json.routes[0];

  const route = data.geometry.coordinates;
  console.log("data", data);

  const geojson = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: route,
    },
  };
  if (mapD.getSource("route")) {
    console.log("Route already exists on the map");
    mapD.getSource("route").setData(geojson);
  } else {
    console.log("creating new route");
    console.log(mapD);
    mapD.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: route,
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

  // if (mapObj.getSource("route")) {
  //   console.log("Route already exists on the map");
  //   mapObj.getSource("route").setData(geojson);
  // } else {
  //   console.log("creating new route");
  //   console.log(mapObj);
  //   mapObj.addLayer({
  //     id: "route",
  //     type: "line",
  //     source: {
  //       type: "geojson",
  //       data: geojson,
  //     },
  //     layout: {
  //       "line-join": "round",
  //       "line-cap": "round",
  //     },
  //     paint: {
  //       "line-color": "#3887be",
  //       "line-width": 5,
  //       "line-opacity": 0.75,
  //     },
  //   });
  // }
}

export default {
  name: "DoctorMap",
  data() {
    return {
      mapD: {},
    };
  },
  mounted() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiZmlsaXBzaXBvcyIsImEiOiJjbGo4b2VxdXMxN3VzM2VxenlqbDhyZG14In0.tEoQDyIZe6DeE02GszDilw";

    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/light-v10", // style URL
      center: start, // starting position [lng, lat]
      zoom: 17, // starting zoom
    });
    this.mapD = map;
    console.log(this.mapD);

    this.mapD.scrollZoom.disable();

    //Call the directions API
    this.mapD.on("load", () => {
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

    map.on("click", (event) => {
      const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
      let route = getRoute(coords).then((route) => {
        console.log(route);
      });
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
        map.getSource("end").setData(end);
      } else {
        map.addLayer({
          id: "end",
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
                    coordinates: coords,
                  },
                },
              ],
            },
          },
          paint: {
            "circle-radius": 10,
            "circle-color": "#f30",
          },
        });
      }

      // getRoute(coords, map);
    });
  },
};
</script>
<style lang="scss">
#map {
  width: 100%;
  height: calc(100% + 2rem);
}
</style>

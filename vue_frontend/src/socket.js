
import { io } from "socket.io-client";
import { reactive } from "vue";

export const socket = io("http://martinusius.sk:1337");

export const emergency = reactive({
  id: null,
  location: null,
  medicalData: null,
});

socket.on('doctors-notified', (count) => {
  console.log('Doctors notified: ', count);
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('emergency-canceled', (id) => {
  if (emergency.id !== id) return;

  emergency.id = null;
  emergency.location = null;
  emergency.medicalData = null;
});

socket.on('emergency', (id, location, medicalData) => {
  if (emergency.id) return;

  console.log('emergency', id);

  emergency.id = id;
  emergency.location = location;
  emergency.medicalData = medicalData;
});
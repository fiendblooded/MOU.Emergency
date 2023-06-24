
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
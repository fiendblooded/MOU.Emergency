<template>
  <v-btn-group
    ><v-btn @click="cancelCalling" icon="mdi-format-align-center"></v-btn>
    <v-btn @click="arrived" icon="mdi-format-align-right"></v-btn>
    <v-btn
      @click="callHelp"
      icon-size="x-large"
      icon="mdi-format-align-justify"
    ></v-btn
  ></v-btn-group>
</template>
<script>
export default {
  name: "DoctorButtons",
  methods: {
    callHelp() {},
    cancelCalling() {},
    arrived() {},
  },
};
</script>
<style lang="scss"></style>

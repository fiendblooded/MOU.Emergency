<template>
  <div id="letterspace" class="letterspace pa-4 pt-16 contain">
    <v-title block class="text-h5 mb-12 text-center"
      >Vitajte v aplikácii MOU Emergency</v-title
    >
    <div class="btn-cont">
      <v-btn
        block
        size="x-large"
        flat
        color="primary"
        @click="this.$router.push('/')"
        class="mb-3 rounded-lg font-weight-regular"
        >Prihlásiť sa ako používateľ</v-btn
      >
      <v-btn
        block
        size="x-large"
        flat
        color="primary"
        @click="this.$router.push('/doctor')"
        class="rounded-lg font-weight-regular"
        >Prihlásiť sa ako záchranár</v-btn
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "Initial",
};
</script>
<style lang="scss" scoped>
button {
  text-transform: none !important;
}
#letterspace {
  letter-spacing: 1px !important;
}
.btn-cont {
  height: auto;
  width: 100%;
  margin-bottom: 2rem;
}
.contain {
  background-image: linear-gradient(#2e518a, #072c66) !important;
  display: flex;
  align-items: center;
  color: white;
  justify-content: end;
  flex-direction: column;
  height: 100vh !important;
}
</style>

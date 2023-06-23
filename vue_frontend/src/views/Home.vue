<template>
  <div class="wrapper">
    <v-btn
      color="#3949A"
      icon="mdi-close"
      class="ma-6 rounded-lg"
      variant="outlined"
    ></v-btn>
  </div>

  <v-list class="font-weight-medium px-5">
    <v-list-item
      prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
      class="mt-10 mb-5"
    >
      <v-title class="font-weight-bold">Daniel Mucha</v-title>
      <p class="subtitle">PČO: 1234567890</p>
    </v-list-item>
    <v-divider class="mb-12"></v-divider>
    <v-list-item>
      <div class="text-h6 mb-4 font-weight-bold">Menu</div></v-list-item
    >
    <v-list-item> Nastavenie Aplikácie </v-list-item>
    <v-list-item> História súhlasov</v-list-item>
    <v-list-item> Kontakt </v-list-item>
    <v-list-item> Osobný asistnent </v-list-item>
    <v-list-item> O aplikácii </v-list-item>
    <v-list-item class="logout mb-10"> Odhlásiť sa</v-list-item>
    <div class="center">
      <v-btn
        @click="this.$router.push('/map')"
        color="error"
        class="btn"
        size="x-large"
        rounded="xl"
        >Privolať pomoc</v-btn
      >
    </div>
    <p></p>
  </v-list>
</template>

<script setup></script>
<style>
.logout {
  color: #c3112b !important;
}

.wrapper {
  display: flex;
  justify-content: flex-end;
}

.center {
  display: flex;
  justify-content: center;
}

.subtitle {
  color: grey;
  font-weight: 400;
}
.btn {
  width: 75%;
  font-weight: 400;
  text-transform: none !important;
}
</style>

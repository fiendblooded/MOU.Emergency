<template>
  <v-list class="font-weight-medium px-5">
    <v-list-item
      prepend-avatar="https://cdn.vuetifyjs.com/images/john.png"
      title="John Leider"
      subtitle="PČO:"
      class="mt-10 mb-5"
    >
    </v-list-item>
    <v-divider class="mb-10"></v-divider>
    <v-list-item> Nastavenie Aplikácie </v-list-item>
    <v-list-item> História súhlasov</v-list-item>
    <v-list-item> Kontakt </v-list-item>
    <v-list-item> Osobný asistnent </v-list-item>
    <v-list-item> O aplikácii </v-list-item>
    <v-list-item class="logout"> Odhlásiť sa</v-list-item>
    <v-btn color="error" class="btn" size="x-large" rounded="xl"
      >Privolať pomoc</v-btn
    >
    <p></p>
  </v-list>
</template>

<script setup></script>
<style>
.logout {
  color: #c3112b;
}
.btn {
  position: fixed;
  bottom: 7.6rem;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  font-weight: 400;
  text-transform: none;
}
</style>

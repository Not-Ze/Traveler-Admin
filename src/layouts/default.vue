<template>
  <v-main>
    <Sidebar v-if="!isLoginPage"></Sidebar>
    <router-view />
  </v-main>

  <AppFooter v-if="!isLoginPage" />
</template>

<script setup>
import Sidebar from '@/components/SideBar.vue';
import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()
import AppFooter from '@/components/AppFooter.vue';

const isLoginPage = computed(() => {
    // Check if the current route is either '/sign' or '/login'
    return route.path === '/login';
});
</script>

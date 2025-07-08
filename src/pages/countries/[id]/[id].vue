<template>
  <v-container v-if="!areaLoading ">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="8">
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn color="primary" class="white--text" elevation="2" @click="router.push(`/countries/${cityId.value}/create`)">
          Add Area
          <v-icon right>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table Component -->
    <Table
      :items="areas"
      :loading="isLoading"
      :config="tableConfig"
      :meta="paginationMeta"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @action="handleAction"
    />
  </v-container>
  <v-container v-else-if="areaLoading">
    <v-row justify="center" class="mt-16">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-alert type="error">Area not found.</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAreaStore } from '../../../stores/areaStore';
import { storeToRefs } from 'pinia';
import Table from '../../../components/Table.vue';

const route = useRoute();
const router = useRouter();
const areaStore = useAreaStore();

const cityId = computed(() => route.params.id);

const { areas, isLoading, paginationMeta } = storeToRefs(areaStore);
const { currentArea: area, isLoading: areaLoading } = storeToRefs(areaStore);

const filters = ref({});
const pagination = ref({
  page: 1,
  perPage: 10,
});

const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'areaDescription' },
  ],
  filters: [
    { type: 'text', key: 'name', label: 'Area Name' },
  ],
  actions: [
    { name: 'edit', icon: 'mdi-pencil', color: 'green' },
    { name: 'delete', icon: 'mdi-delete', color: 'red' },
  ],
});

const fetchAreasData = () => {
  const currentFilters = { ...filters.value, area_id: cityId.value };
  areaStore.fetchAreas(pagination.value.page, pagination.value.perPage, currentFilters);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
  pagination.value.page = 1;
  fetchAreasData();
};

const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  fetchAreasData();
};

const handleAction = async ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push(`/areas/${cityId.value}/${item.id}`);
      break;
    case 'edit':
      router.push(`/areas/${cityId.value}/edit/${item.id}`);
      break;
    case 'delete':
      if (confirm('Are you sure you want to delete this area?')) {
        await areaStore.deleteArea(item.id);
        fetchAreasData();
      }
      break;
  }
};

const addArea = () => {
  router.push({ path: '/areas/add', query: { cityId: cityId.value } });
};

onMounted(() => {
  areaStore.fetchAreaById(cityId.value);
  console.log('Fetching areas for city:', cityId);
  areaStore.fetchAreas(1, 1, { city_id: cityId.value });
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>

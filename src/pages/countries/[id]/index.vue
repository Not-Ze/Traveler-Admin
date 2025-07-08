<template>
  <v-container v-if="!countryLoading && country">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="8">
        <h1 class="text-h4 font-weight-bold">Cities in {{ country.countryName }}</h1>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn color="primary" class="white--text" elevation="2" @click="addCity">
          Add City
          <v-icon right>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table Component -->
    <Table
      :items="cities"
      :loading="isLoading"
      :config="tableConfig"
      :meta="paginationMeta"
      @page-change="handlePageChange"
      @filter-change="handleFilterChange"
      @action="handleAction"
    />
  </v-container>
  <v-container v-else-if="countryLoading">
    <v-row justify="center" class="mt-16">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-alert type="error">Country not found.</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCityStore } from '../../../stores/cityStore';
import { useCountryStore } from '../../../stores/countryStore';
import { storeToRefs } from 'pinia';
import Table from '../../../components/Table.vue';

const route = useRoute();
const router = useRouter();
const cityStore = useCityStore();
const countryStore = useCountryStore();

const countryId = computed(() => route.params.id);

const { cities, isLoading, paginationMeta } = storeToRefs(cityStore);
const { currentCountry: country, isLoading: countryLoading } = storeToRefs(countryStore);

const filters = ref({});
const pagination = ref({
  page: 1,
  perPage: 10,
});

const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'cityName' },
  ],
  filters: [
    { type: 'text', key: 'name', label: 'City Name' },
  ],
  actions: [
    { name: 'view', icon: 'mdi-eye', color: 'blue' },
    { name: 'edit', icon: 'mdi-pencil', color: 'green' },
    { name: 'delete', icon: 'mdi-delete', color: 'red' },
  ],
});

const fetchCitiesData = () => {
  const currentFilters = { ...filters.value, country_id: countryId.value };
  cityStore.fetchCities(pagination.value.page, pagination.value.perPage, currentFilters);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
  pagination.value.page = 1;
  fetchCitiesData();
};

const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  fetchCitiesData();
};

const handleAction = async ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push(`/countries/${countryId.value}/${item.id}`);
      break;
    case 'edit':
      router.push(`/countries/${countryId.value}/cities/${item.id}/edit`);
      break;
    case 'delete':
      if (confirm('Are you sure you want to delete this city?')) {
        await cityStore.deleteCity(item.id);
        fetchCitiesData();
      }
      break;
  }
  };

const addCity = () => {
  router.push({ path: '/cities/add', query: { countryId: countryId.value } });
};

onMounted(() => {
  countryStore.fetchCountryById(countryId.value);
  fetchCitiesData();
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>

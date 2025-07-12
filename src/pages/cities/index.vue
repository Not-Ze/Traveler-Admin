<template>
  <v-container v-if="!countryLoading && country">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="8">
        <h1 class="text-h4 font-weight-bold">Cities in {{ country.name }}</h1>
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
    <DeleteConfirmationDialog
      v-model="deleteDialogVisible"
      :itemName="deleteItemName"
      itemLabel="city"
      @confirm="handleDelete"
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
import { useCityStore } from '../../stores/cityStore';
import { useCountryStore } from '../../stores/countryStore';
import { storeToRefs } from 'pinia';
import Table from '../../components/Table.vue';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const cityStore = useCityStore();
const countryStore = useCountryStore();

// Get country_id from query string
const countryId = computed(() => route.query.country_id);

const { cities, isLoading, paginationMeta } = storeToRefs(cityStore);
const { currentCountry: country, isLoading: countryLoading } = storeToRefs(countryStore);

// Initialize search filter from query param
const filters = ref({ search: route.query.search || '' });

// Initialize pagination from query param
const pagination = ref({
  page: Number(route.query.page) || 1,
  perPage: 10,
});

const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'name' },
  ],
  filters: [
    { type: 'text', key: 'search', label: 'City Name' },
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
  // Reflect filter change in URL
  router.replace({ query: { search: filters.value.search, country_id: countryId.value, page: 1 } });
  fetchCitiesData();
};

const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  // Reflect page change in URL
  router.replace({ query: { search: filters.value.search, country_id: countryId.value, page: pagination.value.page } });
  fetchCitiesData();
};

const deleteDialogVisible = ref(false);
const deleteItemId = ref(null);
const deleteItemName = ref('');
const toast = useToast();

const handleAction = ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push({
        path: '/areas',
        query: { search: '', city_id: item.id, is_recommended: '', page: 1 }
      });
      break;
    case 'edit':
      router.push({ path: '/cities/edit', query: { city_id: item.id, country_id: countryId.value } });
      break;
    case 'delete':
      deleteItemId.value = item.id;
      deleteItemName.value = item.name;
      deleteDialogVisible.value = true;
      break;
  }
};

const handleDelete = async () => {
  try {
    await cityStore.deleteCity(deleteItemId.value);
    toast.success('City deleted successfully!');
    fetchCitiesData();
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'Failed to delete city.');
  } finally {
    deleteDialogVisible.value = false;
  }
};

// Navigate to add city, preserving country_id
const addCity = () => {
  router.push({ path: '/cities/create', query: { country_id: countryId.value } });
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

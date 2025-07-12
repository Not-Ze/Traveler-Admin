<template>
  <v-container v-if="!areaLoading && !cityLoading && city">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="8">
        <h1 class="display-1 font-weight-bold">{{ city.name }} - Areas</h1>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn color="primary" class="white--text" elevation="2" @click="addArea">
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
    <DeleteConfirmationDialog
      v-model="deleteDialogVisible"
      :itemName="deleteItemName"
      itemLabel="area"
      @confirm="handleDelete"
    />
  </v-container>
  <v-container v-else-if="areaLoading || cityLoading">
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
import { useAreaStore } from '../../stores/areaStore';
import { useCityStore } from '../../stores/cityStore';
import { storeToRefs } from 'pinia';
import Table from '../../components/Table.vue';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const areaStore = useAreaStore();
const cityStore = useCityStore();

// Get city_id from query string
const cityId = computed(() => route.query.city_id);

// Initialize filters from query parameters
const filters = ref({
  search: route.query.search || '',
  is_recommended: route.query.is_recommended || ''
});

// Initialize pagination from query parameter
const pagination = ref({
  page: Number(route.query.page) || 1,
  perPage: 10,
});

const { areas, isLoading, paginationMeta } = storeToRefs(areaStore);
const { currentCity: city, isLoading: cityLoading } = storeToRefs(cityStore);

const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'name' },
    { title: 'Description', key: 'description' },
  ],
  filters: [
    { type: 'text', key: 'search', label: 'Area Name' },
  ],
  actions: [
    { name: 'edit', icon: 'mdi-pencil', color: 'green' },
    { name: 'delete', icon: 'mdi-delete', color: 'red' },
  ],
});

// Fetch areas using current filters and pagination
const fetchAreasData = () => {
  const currentFilters = { ...filters.value, city_id: cityId.value };
  areaStore.fetchAreas(
    pagination.value.page,
    pagination.value.perPage,
    currentFilters
  );
};

// Update filters and reflect changes in URL and data
const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
  pagination.value.page = 1;
  router.replace({ query: {
    search: filters.value.search,
    is_recommended: filters.value.is_recommended,
    city_id: cityId.value,
    page: 1
  } });
  fetchAreasData();
};

// Update page and reflect changes in URL and data
const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  router.replace({ query: {
    search: filters.value.search,
    is_recommended: filters.value.is_recommended,
    city_id: cityId.value,
    page: pagination.value.page
  } });
  fetchAreasData();
};

const deleteDialogVisible = ref(false);
const deleteItemId = ref(null);
const deleteItemName = ref('');
const toast = useToast();

const handleAction = ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push(`/areas/${cityId.value}/${item.id}`);
      break;
    case 'edit':
      router.push({ path: '/areas/edit', query: { city_id: cityId.value, area_id: item.id } });
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
    await areaStore.deleteArea(deleteItemId.value);
    toast.success('Area deleted successfully!');
    fetchAreasData();
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'Failed to delete area.');
  } finally {
    deleteDialogVisible.value = false;
  }
};

// Navigate to add area, preserving city_id
const addArea = () => {
  router.push({ path: '/areas/create', query: { city_id: cityId.value } });
};

onMounted(() => {
  // Fetch city details and areas list
  cityStore.fetchCityById(cityId.value);
  areaStore.fetchAreas(1, 1, { city_id: cityId.value });
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>

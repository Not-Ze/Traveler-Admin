<template>
  <v-container>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="8">
        <h1 class="text-h4 font-weight-bold">Countries Management</h1>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn color="primary" class="white--text" elevation="2" @click="addCountry">
          Add Country
          <v-icon right>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Table Component -->
    <Table
      :items="countries"
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
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCountryStore } from '../../stores/countryStore';
import { storeToRefs } from 'pinia';
import Table from '../../components/Table.vue';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const countryStore = useCountryStore();
const { countries, isLoading, paginationMeta } = storeToRefs(countryStore);

const filters = ref({});
const pagination = ref({
  page: 1,
  perPage: 10,
});

const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'name' },
  ],
  filters: [
    { type: 'text', key: 'search', label: 'Name' },
  ],
  actions: [
    { name: 'view', icon: 'mdi-eye', color: 'blue' },
    { name: 'edit', icon: 'mdi-pencil', color: 'green' },
    { name: 'delete', icon: 'mdi-delete', color: 'red' },
  ],
});

const fetchCountriesData = () => {
  countryStore.fetchCountries(pagination.value.page, pagination.value.perPage, filters.value);
};

const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
  pagination.value.page = 1; // Reset to first page on filter change
  fetchCountriesData();
};

const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  fetchCountriesData();
};

const toast = useToast();
const deleteDialogVisible = ref(false);
const deleteItemId = ref(null);
const deleteItemName = ref('');

const handleAction = ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push({
        path: '/cities',
        query: {
          search: '',
          country_id: item.id,
          page: 1,
        },
      });
      break;
    case 'edit':
      router.push({ path: '/countries/edit', query: { country_id: item.id } });
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
    await countryStore.deleteCountry(deleteItemId.value);
    toast.success('Country deleted successfully!');
    fetchCountriesData();
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'Failed to delete country.');
  } finally {
    deleteDialogVisible.value = false;
  }
};

const addCountry = () => {
  router.push('/countries/create');
};

onMounted(() => {
  fetchCountriesData();
  console.log(countries.value);
});
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>

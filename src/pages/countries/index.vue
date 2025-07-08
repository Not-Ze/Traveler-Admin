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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCountryStore } from '../../stores/countryStore';
import { storeToRefs } from 'pinia';
import Table from '../../components/Table.vue';

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
    { title: 'Name', key: 'countryName' },
  ],
  filters: [
    { type: 'text', key: 'name', label: 'Name' },
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

const handleAction = async ({ name, item }) => {
  switch (name) {
    case 'view':
      router.push(`/countries/${item.id}`);
      break;
    case 'edit':
      router.push(`/countries/${item.id}/edit`);
      break;
    case 'delete':
      if (confirm('Are you sure you want to delete this country?')) {
        await countryStore.deleteCountry(item.id);
        fetchCountriesData();
      }
      break;
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
<template>
  <v-container>
    <!-- Header Section -->
    <v-row class="mb-6">
    <v-col cols="8">
      <h1 class="text-h4 font-weight-bold">Users Management</h1>
    </v-col>
    <v-col cols="4" class="text-right">
      <v-btn color="primary" class="white--text" elevation="2" to="/users/create">
      Add User
      <v-icon right>mdi-plus</v-icon>
      </v-btn>
    </v-col>
    </v-row>

    <!-- Table Component -->
    <Table
    :items="users"
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
  import { useUserStore } from '../../stores/userStore';
  import { storeToRefs } from 'pinia';
  import Table from '../../components/Table.vue';

  const router = useRouter();
  const userStore = useUserStore();
  const { users, isLoading, paginationMeta } = storeToRefs(userStore);

  const filters = ref({});
  const pagination = ref({
  page: 1,
  perPage: 10,
  });

  const tableConfig = ref({
  headers: [
    { title: 'Name', key: 'name' },
    { title: 'Email Address', key: 'email' },
    { title: 'Gender', key: 'sex' },
  ],
  filters: [
    { type: 'text', key: 'name', label: 'Name' },
  ],
  actions: [
    { name: 'view', icon: 'mdi-eye', color: 'blue' },
    { name: 'edit', icon: 'mdi-pencil', color: 'green' },
    { name: 'ban', icon: 'mdi-cancel', color: 'red', condition: (item) => item.status !== 'banned' },
    { name: 'unban', icon: 'mdi-check-circle', color: 'green', condition: (item) => item.status === 'banned' },
  ],
  });

  const fetchUsersData = () => {
  userStore.fetchUsers(pagination.value.page, pagination.value.perPage, filters.value);
  };

  const handleFilterChange = (newFilters) => {
  filters.value = newFilters;
  pagination.value.page = 1; // Reset to first page on filter change
  fetchUsersData();
  };

  const handlePageChange = (newPagination) => {
  pagination.value = newPagination;
  fetchUsersData();
  };

  const handleAction = async ({ name, item }) => {
  switch (name) {
    case 'view':
    router.push({ name: '/users/[id]', params: { id: item.id } });
    break;
    case 'edit':
    router.push({ path: '/users/edit', query: { id: item.id } });
    break;
    case 'ban':
    if (confirm('Are you sure you want to ban this user?')) {
      await userStore.banUser(item.id);
    }
    break;
    case 'unban':
    if (confirm('Are you sure you want to unban this user?')) {
      await userStore.unbanUser(item.id);
    }
    break;
  }
  };


  onMounted(() => {
  fetchUsersData();
  console.log(users.value);
  });
  </script>

  <style scoped>
  .text-right {
  text-align: right;
  }
  </style>

<template>
    <v-container>
        <!-- Stats Cards -->
        <v-row class="mb-12 pt-4 px-4">
            <v-col cols="12" md="6">
            <v-card elevation="2">
                <v-card-title>Total Users</v-card-title>
                <v-card-text class="text-h3 font-weight-bold">
                {{ userPaginationMeta?.total || 13 }}
                </v-card-text>
            </v-card>
            </v-col>
            <v-col cols="12" md="6">
            <v-card elevation="2">
                <v-card-title>Total Countries</v-card-title>
                <v-card-text class="text-h3 font-weight-bold">
                {{ countryPaginationMeta?.total || 5 }}
                </v-card-text>
            </v-card>
            </v-col>
        </v-row>

        <!-- Users Section -->
        <v-row class="mb-6">
            <v-col cols="8">
                <h1 class="text-h4 font-weight-bold">Users Management</h1>
            </v-col>

        </v-row>
        <Table
            :items="users"
            :loading="isUsersLoading"
            :config="userTableConfig"
            :meta="userPaginationMeta"
            @page-change="handleUserPageChange"
            @filter-change="handleUserFilterChange"
            @action="handleUserAction"
        />

        <v-divider class="my-12"></v-divider>

        <!-- Countries Section -->
        <v-row class="mb-6">
            <v-col cols="8">
                <h1 class="text-h4 font-weight-bold">Countries Management</h1>
            </v-col>

        </v-row>
        <Table
            :items="countries"
            :loading="isCountriesLoading"
            :config="countryTableConfig"
            :meta="countryPaginationMeta"
            @page-change="handleCountryPageChange"
            @filter-change="handleCountryFilterChange"
            @action="handleCountryAction"
        />
        <DeleteConfirmationDialog
            v-model="deleteDialogVisible"
            :itemName="deleteItemName"
            itemLabel="country"
            @confirm="handleDelete"
        />
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { useCountryStore } from '../stores/countryStore';
import { storeToRefs } from 'pinia';
import Table from '../components/Table.vue';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();

// --- Users Logic ---
const userStore = useUserStore();
const { users, isLoading: isUsersLoading, paginationMeta: userPaginationMeta } = storeToRefs(userStore);

const userFilters = ref({});
const userPagination = ref({
    page: 1,
    perPage: 5,
});

const userTableConfig = ref({
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
    userStore.fetchUsers(userPagination.value.page, userPagination.value.perPage, userFilters.value);
};

const handleUserFilterChange = (newFilters) => {
    userFilters.value = newFilters;
    userPagination.value.page = 1;
    fetchUsersData();
};

const handleUserPageChange = (newPagination) => {
    userPagination.value = newPagination;
    fetchUsersData();
};

const handleUserAction = async ({ name, item }) => {
    switch (name) {
        case 'view':
            router.push(`/users/${item.id}`);
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

// --- Countries Logic ---
const countryStore = useCountryStore();
const { countries, isLoading: isCountriesLoading, paginationMeta: countryPaginationMeta } = storeToRefs(countryStore);

const countryFilters = ref({});
const countryPagination = ref({
    page: 1,
    perPage: 5,
});

const countryTableConfig = ref({
    headers: [
        { title: 'Name', key: 'name' },
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
    countryStore.fetchCountries(countryPagination.value.page, countryPagination.value.perPage, countryFilters.value);
};

const handleCountryFilterChange = (newFilters) => {
    countryFilters.value = newFilters;
    countryPagination.value.page = 1;
    fetchCountriesData();
};

const handleCountryPageChange = (newPagination) => {
    countryPagination.value = newPagination;
    fetchCountriesData();
};

const deleteDialogVisible = ref(false);
const deleteItemId = ref(null);
const deleteItemName = ref('');
const toast = useToast();

const handleCountryAction = ({ name, item }) => {
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

onMounted(() => {
    fetchUsersData();
    fetchCountriesData();
});
</script>

<style scoped>
.text-right {
    text-align: right;
}
</style>

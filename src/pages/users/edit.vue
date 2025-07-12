<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-card max-width="500" class="w-100 pa-4">
            <v-card-title class="text-h5 text-center">Edit User</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="handleSubmit">
                    <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
                    <v-text-field
                        v-model="form.name"
                        label="Name"
                        required
                    ></v-text-field>
                    <v-text-field
                        v-model="form.email"
                        label="Email"
                        type="email"
                        required
                    ></v-text-field>
                    <v-text-field
                        v-model="form.birth_date"
                        label="Birth Date"
                        type="date"
                        required
                    ></v-text-field>
                    <v-select
                        v-model="form.sex"
                        :items="sexItems"
                        label="Sex"
                        required
                    ></v-select>
                    <v-btn type="submit" color="#d98b2b" block class="mt-4" :loading="isLoading">Update</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { useUserStore } from '@/stores/userStore';
import { mapState } from 'pinia';
import { useToast } from 'vue-toastification';

export default {
    name: "EditUser",
    data() {
        return {
            form: {
                name: "",
                email: "",
                birth_date: "",
                sex: null,
            },
            sexItems: ['male', 'female'],
            error: null,
        };
    },
    computed: {
        ...mapState(useUserStore, ['isLoading']),
    },
    async mounted() {
        const userStore = useUserStore();
        const userId = this.$route.query.id;
        console.log('Fetching user with ID:', userId);
        try {
            await userStore.fetchUserById(userId);
            const user = userStore.currentUser;
            this.form.name = user.name;
            this.form.email = user.email;
            this.form.birth_date = user.birth_date;
            this.form.sex = user.sex;
        } catch (error) {
            this.error = error.message || 'Failed to fetch user.';
        }
    },
    methods: {
        async handleSubmit() {
            const toast = useToast();
            this.error = null;
            const userStore = useUserStore();
            const userId = this.$route.query.id;
            try {
                await userStore.updateUser(userId, this.form);
                await userStore.fetchUsers();
                toast.success("User updated successfully!");
                this.$router.push('/users');
            } catch (error) {
                this.error = error.message || "Failed to update user.";
                toast.error(this.error);
            }
        },
    },
};
</script>

<style scoped>
/* Scoped styles are no longer needed as Vuetify handles component styling */
</style>

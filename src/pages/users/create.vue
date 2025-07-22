<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-card max-width="500" class="w-100 pa-4">
            <v-card-title class="text-h5 text-center">Add User</v-card-title>
            <v-card-text>
                <v-form @submit.prevent="handleSubmit">
                    <v-alert v-if="error" type="error" dense class="mb-4">{{ error }}</v-alert>
                    <v-text-field
                        v-model="form.name"
                        label="Name"
                        required
                        :rules="[v => !!v || 'Name is required']"
                    ></v-text-field>
                    <v-text-field
                        v-model="form.email"
                        label="Email"
                        type="email"
                        required
                        :rules="[v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                    ></v-text-field>
                    <v-text-field
                        v-model="form.birth_date"
                        label="Birth Date"
                        type="date"
                        :rules="[v => !!v || 'Birth Date is required']"
                        :max="new Date().toISOString().substr(0, 10)"
                    ></v-text-field>
                    <v-text-field
                        v-model="form.password"
                        label="Password"
                        type="password"
                        :rules="[v => !!v || 'Password is required']"
                    ></v-text-field>
                    <v-text-field
                        v-model="form.password_confirmation"
                        label="Confirm Password"
                        type="password"
                        :rules="[v => !!v || 'Password is required']"
                    ></v-text-field>
                <v-select
                    v-model="form.sex"
                    :items="sexItems"
                    label="Sex"
                    :rules="[v => !!v || 'Sex is required']"
                ></v-select>
                <v-select
                    v-model="form.user_type"
                    :items="userTypeItems"
                    label="User Type"
                    :rules="[v => !!v || 'required']"
                ></v-select>
                    <v-btn type="submit" color="#d98b2b" block class="mt-4" :loading="isLoading">Add</v-btn>
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
    name: "AddUser",
    data() {
        return {
            form: {
                name: "",
                email: "",
                birth_date: "",
                password: "",
                password_confirmation: "",
                sex: null,
                user_type: null,
            },
            sexItems: ['male', 'female'],
            userTypeItems: ['admin', 'user'],
            error: null,
        };
    },
    computed: {
        ...mapState(useUserStore, ['isLoading']),
    },
    methods: {
        async handleSubmit() {
            const toast = useToast();
            this.error = null;
            if (this.form.password !== this.form.password_confirmation) {
                this.error = "Passwords do not match.";
                toast.error(this.error);
                return;
            }
            const userStore = useUserStore();
            try {
                await userStore.addUser(this.form);
                await userStore.fetchUsers(); // Refresh the user list
                toast.success("User added successfully!");
                this.$router.push('/users');
            } catch (error) {
                this.error = error.message || "Failed to add user.";
                toast.error(userStore.error || this.error);
                console.error("Failed to add user:", error);
            }
        },
    },
};
</script>

<style scoped>
/* Scoped styles are no longer needed as Vuetify handles component styling */
</style>

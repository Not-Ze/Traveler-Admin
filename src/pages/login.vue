<template>
    <v-container fluid class="login-page fill-height pa-5">
        <v-row align="center" justify="center" class="fill-height pl-5 pr-5">
            <v-col cols="12" md="10">
                <v-card class="elevation-12">
                    <v-row no-gutters>
                        <v-col cols="12" md="4" class="d-none d-md-flex align-center justify-center mr-10">
                            <v-img
                                src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHJhdmVsfGVufDB8fDB8fHww&w=1000&q=80"
                                alt="Travel background" height="100%" cover></v-img>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card-text class="pa-8 pa-md-12">
                                <div class="d-flex align-center mb-8">
                                    <v-img src="@/assets/blacklogo.png" alt="Traveler Logo" max-height="120"
                                        max-width="120" contain class="mx-auto pb-10"></v-img>
                                </div>

                                <div class="d-flex flex-column justify-center"
                                    style="padding-top: 50px; padding-bottom: 50px;">
                                    <h1 class="text-h5 font-weight-bold mb-4">
                                        Welcome Back!
                                    </h1>
                                    <v-alert v-if="authStore.error" type="error" dense outlined class="mb-4">
                                        {{ authStore.error }}
                                    </v-alert>
                                    <v-text-field 
                                        label="Email Address" 
                                        outlined 
                                        dense 
                                        clearable 
                                        v-model="authStore.email"
                                        :disabled="authStore.loading"
                                    ></v-text-field>
                              
                                    <v-text-field 
                                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" 
                                        :type="showPassword ? 'text' : 'password'"
                                        class="input-group--focused" 
                                        hint="At least 8 characters" 
                                        label="Password"
                                        name="input-10-2" 
                                        outlined
                                        dense
                                        v-model="authStore.password"
                                        @click:append="showPassword = !showPassword"
                                        :disabled="authStore.loading"
                                        @keyup.enter="handleLogin"
                                    ></v-text-field>
                                    <div class="text-right mb-4">
                                        
                                    </div>
                                    <v-btn 
                                        block 
                                        color="orange" 
                                        dark 
                                        large 
                                        class="mb-3"
                                        style="color: white !important;"
                                        @click="handleLogin"
                                        :loading="authStore.loading"
                                        :disabled="authStore.loading"
                                    >Login</v-btn>
                                    
                                </div>
                            </v-card-text>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth'; // Ensure this path is correct

export default {
    name: 'LoginPage',
    data() {
        return {
            showPassword: false, // Renamed from show2 for clarity
        };
    },
    setup() {
        const authStore = useAuthStore();
        return {
            authStore,
        };
    },
    methods: {
        async handleLogin() {
            await this.authStore.login();
            // Navigation is handled within the store action upon successful login
        },
    },
    created() {
        // Clear any previous errors when the component is created
        if (this.authStore.error) {
            this.authStore.error = null;
        }
        // Reset email and password fields in store if desired, or manage them locally
        // this.authStore.email = '';
        // this.authStore.password = '';
    }
};
</script>

<style scoped>
.login-page {
    background-color: #f0f2f5;
    /* A light background for the page */
}

/* You can add more specific styles here if Vuetify's utility classes aren't enough */
.text-orange {
    color: #f39c12 !important;
    /* Vuetify orange or your custom orange */
}
</style>

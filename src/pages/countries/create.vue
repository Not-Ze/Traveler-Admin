<template>
  <div class="w-100 text-left mt-4 ml-4 ">
    <v-btn icon @click="goBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </div>
   <v-container class="fill-height d-flex flex-column align-center justify-center">
        <v-card max-width="400" class="w-100 pa-4">
        <v-card-title class="text-h4 font-weight-bold mb-4">Add Country</v-card-title>
            <v-card-text class="pa-0">
                <v-form @submit.prevent="addCountry">
                    <v-text-field
                        v-model="CountryName"
                        label="Country Name"
                        variant="outlined"
                        required
                    ></v-text-field>
                    <v-btn type="submit" color="#d98b2b" block class="mt-4">Add</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { useCountryStore } from '../../stores/countryStore.js';
import { useToast } from 'vue-toastification';

export default {
    name: "AddCountry",
    data() {
        return {
            CountryName: "",
        };
    },
    methods: {
        // Navigate back
        goBack() {
          this.$router.back();
        },
        // Use Pinia store to add a country
        async addCountry() {
            const toast = useToast();
            if (this.CountryName.trim()) {
                const countryStore = useCountryStore();
                try {
                    await countryStore.addCountry({ name: this.CountryName });
                    this.CountryName = ""; // Clear input after submission
                    toast.success("Country added successfully!");
                    this.$router.push('/countries');
                } catch (error) {
                    toast.error(error.response?.data?.message || error.message);
                }
            } else {
                toast.error("Please enter a Country name.");
            }
        },
    },
};
</script>

<style scoped>
/* Using Vuetify components, most styling is handled by the framework. */
</style>

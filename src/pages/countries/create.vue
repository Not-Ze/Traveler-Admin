<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-card max-width="400" class="w-100 pa-4">
            <v-card-title class="text-h4 font-weight-bold mb-4">Country</v-card-title>
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
export default {
    name: "AddCountry",
    data() {
        return {
            CountryName: "",
        };
    },
    methods: {
        addCountry() {
            if (this.CountryName.trim()) {
                console.log("Country added:", this.CountryName);
                this.CountryName = ""; // Clear input after submission
            } else {
                alert("Please enter a Country name.");
            }
        },
    },
};
</script>

<style scoped>
/* Using Vuetify components, most styling is handled by the framework. */
</style>

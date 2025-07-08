<template>
    <v-container class="fill-height d-flex align-center justify-center">
        <v-card max-width="400" class="w-100 pa-4">
            <v-card-title class="text-h4 font-weight-bold mb-4">Add Area</v-card-title>
            <v-card-text class="pa-0">
                <v-form @submit.prevent="handleSubmit">
                    <v-text-field
                        v-model="form.areaName"
                        label="Area Name"
                        variant="outlined"
                        required
                    ></v-text-field>
                    <v-textarea
                        v-model="form.description"
                        label="Description"
                        variant="outlined"
                        rows="4"
                        required
                    ></v-textarea>
                    <v-btn type="submit" color="#f57c00" block class="mt-4">Add</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
export default {
    name: "AddManualArea",
    data() {
        return {
            form: {
                areaName: "",
                description: "",
            },
        };
    },
    methods: {
        handleSubmit() {
            if (this.form.areaName.trim() && this.form.description.trim()) {
                console.log("Form submitted:", this.form);
                this.form.areaName = "";
                this.form.description = "";
            } else {
                alert("Please fill out all fields.");
            }
        },
    },
};
</script>

<style scoped>
/* Using Vuetify components, most styling is handled by the framework. */
</style>

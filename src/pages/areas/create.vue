<template>
    <v-container class="fill-height d-flex flex-column align-center justify-center">
      <!-- Back arrow top-left -->
      <div class="w-100 text-left mb-4">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </div>
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
                    <v-switch
                        v-model="form.isRecommended"
                        label="Recommended"
                        class="mt-4"
                    ></v-switch>
                    <v-btn type="submit" color="#f57c00" block class="mt-4">Add</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import { useAreaStore } from '../../stores/areaStore';
import { useToast } from 'vue-toastification';

export default {
    name: "AddManualArea",
    data() {
        return {
            form: {
                areaName: "",
                description: "",
                isRecommended: false,
            },
        };
    },
    methods: {
        async handleSubmit() {
            const areaStore = useAreaStore();
            const toast = useToast();
            const cityId = this.$route.query.city_id;
            if (this.form.areaName.trim() && this.form.description.trim()) {
                try {
                    await areaStore.addArea({
                        name: this.form.areaName,
                        city_id: cityId,
                        description: this.form.description,
                        is_recommended: this.form.isRecommended,
                    });
                    toast.success('Area added successfully!');
                    this.$router.push({ path: '/areas', query: { city_id: cityId } });
                } catch (error) {
                    toast.error(error.response?.data?.message || error.message);
                }
            } else {
                toast.error("Please fill out all fields.");
            }
        },
        // Navigate back
        goBack() {
          this.$router.back();
        }
    },
};
</script>

<style scoped>
/* Using Vuetify components, most styling is handled by the framework. */
</style>

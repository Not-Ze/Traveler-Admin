<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <!-- Back arrow top-left -->
    <div class="w-100 text-left mb-4">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </div>
    <v-card max-width="400" class="w-100 pa-4">
      <v-card-title class="text-h4 font-weight-bold mb-4">Edit Area</v-card-title>
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
          <v-btn type="submit" color="primary" block class="mt-4">Update</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useAreaStore } from '../../stores/areaStore';
export default {
  name: 'EditArea',
  data() {
    return {
      form: {
        areaName: '',
        description: '',
        isRecommended: false,
      },
      loading: true,
    };
  },
  async mounted() {
    const areaStore = useAreaStore();
    const cityId = this.$route.query.city_id;
    const areaId = this.$route.query.area_id;
    try {
      await areaStore.fetchAreaById(areaId);
      const area = areaStore.currentArea;
      this.form.areaName = area.name;
      this.form.description = area.description;
      this.form.isRecommended = area.is_recommended;
    } catch (error) {
      console.error('Error fetching area:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async handleSubmit() {
      const areaStore = useAreaStore();
      const cityId = this.$route.query.city_id;
      const areaId = this.$route.query.area_id;
      if (this.form.areaName.trim() && this.form.description.trim()) {
        try {
          await areaStore.updateArea(areaId, {
            name: this.form.areaName,
            city_id: cityId,
            description: this.form.description,
            is_recommended: this.form.isRecommended,
          });
          this.$router.push({ path: '/areas', query: { city_id: cityId } });
        } catch (error) {
          alert(error.response?.data?.message || error.message);
        }
      } else {
        alert('Please fill out all fields.');
      }
    },
    // Navigate back
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        const cityId = this.$route.query.city_id;
        this.$router.push({ path: '/areas', query: { city_id: cityId } });
      }
    },
  },
};
</script>

<style scoped>
/* Using Vuetify default styling */
</style>

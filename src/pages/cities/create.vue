<template>
   <div class="w-100 text-left mt-4 ml-4 ">
    <v-btn icon @click="goBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </div>
  <v-container class="fill-height d-flex flex-column align-center justify-center">

    <v-card max-width="400" class="w-100 pa-4">
      <v-card-title class="text-h4 font-weight-bold mb-4">Add City</v-card-title>
      <v-card-text class="pa-0">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.cityName"
            label="City Name"
            variant="outlined"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block class="mt-4">Add</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useCityStore } from '../../stores/cityStore';
export default {
  name: 'AddCity',
  data() {
    return {
      form: {
        cityName: '',
      },
    };
  },
  methods: {
    async handleSubmit() {
      const cityStore = useCityStore();
      const countryId = this.$route.query.country_id;
      if (this.form.cityName.trim()) {
        try {
          await cityStore.addCity({
            name: this.form.cityName,
            country_id: countryId,
          });
          this.form.cityName = '';
          this.$router.push({ path: '/cities', query: { country_id: countryId } });
        } catch (error) {
          alert(error.response?.data?.message || error.message);
        }
      } else {
        alert('Please enter a city name.');
      }
    },
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style scoped>
/* Using Vuetify default styling */
</style>

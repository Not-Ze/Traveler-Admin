<template>
   <div class="w-100 text-left mt-4 ml-4 ">
    <v-btn icon @click="goBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>
  </div>
  <v-container class="fill-height d-flex flex-column align-center justify-center">

    <v-card max-width="400" class="w-100 pa-4">
      <v-card-title class="text-h4 font-weight-bold mb-4">
        Edit Country
      </v-card-title>
      <v-card-text class="pa-0">
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="form.countryName"
            label="Country Name"
            variant="outlined"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block class="mt-4">Update</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { useCountryStore } from '../../stores/countryStore';
import { useToast } from 'vue-toastification';
export default {
  name: 'EditCountry',
  data() {
    return {
      form: {
        countryName: '',
      },
      loading: true,
    };
  },
  async mounted() {
    const store = useCountryStore();
    // Read country_id from query parameter
    const id = this.$route.query.country_id;
    try {
      await store.fetchCountryById(id);
      const country = store.currentCountry;
      this.form.countryName = country.name;
    } catch (error) {
      console.error('Error fetching country:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async handleSubmit() {
      const store = useCountryStore();
      const toast = useToast();
      // Read country_id from query parameter
      const id = this.$route.query.country_id;
      if (this.form.countryName.trim()) {
        try {
          await store.updateCountry(id, { name: this.form.countryName });
          toast.success('Country updated successfully!');
          this.$router.push('/countries');
        } catch (error) {
          toast.error(error.response?.data?.message || error.message);
        }
      } else {
        toast.error('Please enter a country name.');
      }
    },
    // Navigate back with fallback to countries list
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ path: '/countries' });
      }
    },
  },
};
</script>

<style scoped>
/* Using Vuetify components styling */
</style>

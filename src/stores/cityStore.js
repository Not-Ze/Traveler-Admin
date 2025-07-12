import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useCityStore = defineStore("city", {
    state: () => ({
        cities: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        citySearchResults: [],

        currentCity: null,
        filters: {
            name: '',
            country_id: null,
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchCitiesByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.citySearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[cityName]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/cities",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.citySearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching cities:", error);
                this.error =
                    error.response?.data?.message || "Failed to search cities";
                this.citySearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchCityById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/cities",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentCity = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchCities(page = 1, perPage = 10, filters = {}) {
            try {
                this.isLoading = true;
                this.error = null;

                const params = {
                    page,
                    per_page: perPage,
                };

                for (const key in filters) {
                    if (filters[key] && filters[key] !== 'All') {
                        params[`${key}`] = filters[key];
                    }
                }

                const response = await ApiAxios.index(
                    "/cities",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.cities = response.data.data;
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addCity(cityData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "cities",
                    cityData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.cities.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateCity(id, cityData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "cities",
                    null,
                    cityData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.cities.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.cities[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteCity(cityId) {
            try {
                this.isLoading = true;
                await ApiAxios.delete(
                    cityId,
                    "cities",
                    `Bearer ${Cookies.get("token")}`
                );
                this.cities = this.cities.filter((city) => city.id !== cityId);
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        saveState(filters, pagination) {
            this.filters = { ...filters }
            this.pagination = { ...pagination }
        }
    },

    getters: {
        getCitySearchResults: (state) => state.citySearchResults,
        getCitySearchLoading: (state) => state.searchIsLoading,
        getCities: (state) => state.cities,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getCityDetails: (state) => state.currentCity,
    },
});

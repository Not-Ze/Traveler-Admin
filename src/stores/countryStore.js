import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useCountryStore = defineStore("country", {
    state: () => ({
        countries: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        countrySearchResults: [],

        currentCountry: null,
        filters: {
            name: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchCountriesByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.countrySearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[name]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/countries",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.countrySearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching countries:", error);
                this.error =
                    error.response?.data?.message || "Failed to search countries";
                this.countrySearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchCountryById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/countries",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentCountry = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchCountries(page = 1, perPage = 10, filters = {}) {
            try {
                this.isLoading = true;
                this.error = null;
                
                const params = {
                    page,
                    per_page: perPage,
                };

                for (const key in filters) {
                    if (filters[key] && filters[key] !== 'All') {
                        params[`filter[${key}]`] = filters[key];
                    }
                }

                const response = await ApiAxios.index(
                    "/countries",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.countries = response.data.data;
                console.log("Countries fetched:", this.countries);
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addCountry(countryData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "countries",
                    countryData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.countries.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateCountry(id, countryData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "countries",
                    null,
                    countryData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.countries.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.countries[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteCountry(countryId) {
            try {
                this.isLoading = true;
                await ApiAxios.delete(
                    countryId,
                    "countries",
                    `Bearer ${Cookies.get("token")}`
                );
                this.countries = this.countries.filter((country) => country.id !== countryId);
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
        getCountrySearchResults: (state) => state.countrySearchResults,
        getCountrySearchLoading: (state) => state.searchIsLoading,
        getCountries: (state) => state.countries,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getCountryDetails: (state) => state.currentCountry,
    },
});

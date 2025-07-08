import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useTripStore = defineStore("trip", {
    state: () => ({
        trips: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        tripSearchResults: [],

        currentTrip: null,
        filters: {
            name: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchTripsByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.tripSearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[name]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/trips",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.tripSearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching trips:", error);
                this.error =
                    error.response?.data?.message || "Failed to search trips";
                this.tripSearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchTripById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/trips",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentTrip = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchTrips(page = 1, perPage = 10, filters = {}) {
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
                    "/trips",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.trips = response.data.data;
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addTrip(tripData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "trips",
                    tripData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.trips.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateTrip(id, tripData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "trips",
                    null,
                    tripData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.trips.findIndex((t) => t.id === id);
                if (index !== -1) {
                    this.trips[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteTrip(tripId) {
            try {
                this.isLoading = true;
                await ApiAxios.destroy(
                    tripId,
                    "trips",
                    `Bearer ${Cookies.get("token")}`
                );
                this.trips = this.trips.filter((t) => t.id !== tripId);
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
        getTripSearchResults: (state) => state.tripSearchResults,
        getTripSearchLoading: (state) => state.searchIsLoading,
        getTrips: (state) => state.trips,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getTripDetails: (state) => state.currentTrip,
    },
});

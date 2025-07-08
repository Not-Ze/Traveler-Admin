import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useTripListStore = defineStore("tripList", {
    state: () => ({
        tripLists: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        tripListSearchResults: [],

        currentTripList: null,
        filters: {
            name: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchTripListsByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.tripListSearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[name]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/trip-lists",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.tripListSearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching trip lists:", error);
                this.error =
                    error.response?.data?.message || "Failed to search trip lists";
                this.tripListSearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchTripListById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/trip-lists",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentTripList = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchTripLists(page = 1, perPage = 10, filters = {}) {
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
                    "/trip-lists",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.tripLists = response.data.data;
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addTripList(tripListData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "trip-lists",
                    tripListData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.tripLists.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateTripList(id, tripListData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "trip-lists",
                    null,
                    tripListData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.tripLists.findIndex((tl) => tl.id === id);
                if (index !== -1) {
                    this.tripLists[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteTripList(tripListId) {
            try {
                this.isLoading = true;
                await ApiAxios.destroy(
                    tripListId,
                    "trip-lists",
                    `Bearer ${Cookies.get("token")}`
                );
                this.tripLists = this.tripLists.filter((tl) => tl.id !== tripListId);
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
        getTripListSearchResults: (state) => state.tripListSearchResults,
        getTripListSearchLoading: (state) => state.searchIsLoading,
        getTripLists: (state) => state.tripLists,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getTripListDetails: (state) => state.currentTripList,
    },
});

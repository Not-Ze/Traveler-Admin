import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useTripBudgetLogStore = defineStore("tripBudgetLog", {
    state: () => ({
        tripBudgetLogs: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        tripBudgetLogSearchResults: [],

        currentTripBudgetLog: null,
        filters: {
            description: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchTripBudgetLogsByDescription(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.tripBudgetLogSearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[description]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/trip-budget-logs",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.tripBudgetLogSearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching trip budget logs:", error);
                this.error =
                    error.response?.data?.message || "Failed to search trip budget logs";
                this.tripBudgetLogSearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchTripBudgetLogById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/trip-budget-logs",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentTripBudgetLog = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchTripBudgetLogs(page = 1, perPage = 10, filters = {}) {
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
                    "/trip-budget-logs",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.tripBudgetLogs = response.data.data;
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addTripBudgetLog(logData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "trip-budget-logs",
                    logData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.tripBudgetLogs.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateTripBudgetLog(id, logData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "trip-budget-logs",
                    null,
                    logData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.tripBudgetLogs.findIndex((l) => l.id === id);
                if (index !== -1) {
                    this.tripBudgetLogs[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteTripBudgetLog(logId) {
            try {
                this.isLoading = true;
                await ApiAxios.destroy(
                    logId,
                    "trip-budget-logs",
                    `Bearer ${Cookies.get("token")}`
                );
                this.tripBudgetLogs = this.tripBudgetLogs.filter((l) => l.id !== logId);
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
        getTripBudgetLogSearchResults: (state) => state.tripBudgetLogSearchResults,
        getTripBudgetLogSearchLoading: (state) => state.searchIsLoading,
        getTripBudgetLogs: (state) => state.tripBudgetLogs,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getTripBudgetLogDetails: (state) => state.currentTripBudgetLog,
    },
});

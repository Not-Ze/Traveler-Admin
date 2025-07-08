import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useAreaStore = defineStore("area", {
    state: () => ({
        areas: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        areaSearchResults: [], // for autocomplete results

        currentArea: null,
        filters: {
            name: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchAreasByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.areaSearchResults = []; // Clear results if term is short
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[name]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/areas",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.areaSearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching areas:", error);
                this.error =
                    error.response?.data?.message || "Failed to search areas";
                this.areaSearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchAreaById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/areas",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentArea = response.data.data;
                console.log("Fetched area:", this.currentArea);
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchAreas(page = 1, perPage = 10, filters = {}) {
            try {
                this.isLoading = true;
                this.error = null;
                const params = {
                    page,
                    per_page: perPage,
                };

                for (const key in filters) {
                    if (filters[key]) {
                        params[`filter[${key}]`] = filters[key];
                    }
                }

                const response = await ApiAxios.index(
                    "/areas",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.areas = response.data.data;
                console.log("Fetched areas:", this.areas);
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addArea(areaData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "areas",
                    areaData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.areas.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateArea(id, areaData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "areas",
                    null,
                    areaData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.areas.findIndex((a) => a.id === id);
                if (index !== -1) {
                    this.areas[index] = response.data.data;
                }
                if (this.currentArea && this.currentArea.id === id) {
                    this.currentArea = response.data.data;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteArea(areaId) {
            try {
                this.isLoading = true;
                await ApiAxios.destroy(
                    areaId,
                    "areas",
                    `Bearer ${Cookies.get("token")}`
                );
                this.areas = this.areas.filter((a) => a.id !== areaId);
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
        getAreaSearchResults: (state) => state.areaSearchResults,
        getAreaSearchLoading: (state) => state.searchIsLoading,
        getAreas: (state) => state.areas,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getAreaDetails: (state) => {
            if (!state.currentArea) return null;
            return {
                ...state.currentArea,
                // Add other necessary transformations
            };
        },
    },
});

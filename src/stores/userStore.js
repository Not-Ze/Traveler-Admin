import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useUserStore = defineStore("user", {
    state: () => ({
        users: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false, // *** ADDED separate loading for search ***
        userSearchResults: [], // *** ADDED for autocomplete results ***

        currentUser: null,
        filters: {
            name: '',
            status: 'All',
            classification: '',
            gender: '',
            phone_number: ''
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchUsersByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.users = []; // Clear results if term is short
                return;
            }
            this.searchIsLoading = true; // Use separate loading state
            console.log(
                `Store: Searching users with name containing "${searchTerm}"`
            );
            try {
                const params = {
                    "filter[name]": searchTerm, // Adjust filter key if needed
                    "filter[type]": "user",
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/users", // Verify your users endpoint
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.users = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching users:", error);
                this.error =
                    error.response?.data?.message || "Failed to search users";
                this.users = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchUserById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/users",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentUser = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchUsers(page = 1, perPage = 10, filters = {}) {
            try {
                this.isLoading = true;
                this.error = null;
                const response = await ApiAxios.index(
                    "/users",
                    `Bearer ${Cookies.get("token")}`,
                                );

                this.users = response.data.data;
                console.log(response.data.data);
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addUser(userData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "users",
                    userData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.users.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateUser(id, userData) {
            try {
                this.isLoading = true;
                console.log("User data:", userData, id); // Debug output
                const response = await ApiAxios.update(
                    id,
                    "users",
                    null,
                    {
                        ...userData,
                        password: userData.password || null,
                        password_confirmation: userData.password || null,
                    },
                    `Bearer ${Cookies.get("token")}`,
                    false,
                    {},
                    {}
                );
                const index = this.users.findIndex((u) => u.id === id);
                if (index !== -1) {
                    this.users[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateAddress(addressId, addressData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    addressId,
                    "addresses",
                    null,
                    addressData,
                    `Bearer ${Cookies.get("token")}`
                );

                // Update local state using the API response
                if (this.currentUser) {
                    const addressIndex = this.currentUser.addresses.findIndex(
                        (a) => a.id === addressId
                    );
                    if (addressIndex !== -1) {
                        this.currentUser.addresses[addressIndex] =
                            response.data.data;
                    }
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async banUser(userId) {
            try {
                const response = await ApiAxios.updatePatch(
                    userId,
                    "users",
                    "ban",
                    {}, // Empty body
                    `Bearer ${Cookies.get("token")}`,
                    true, // Allow nulls
                    {}, // Filters
                    {} // Headers
                );
                // Update status in local state
                const user = this.users.find((u) => u.id === userId);
                if (user) user.status = "banned";
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            }
        },

        async unbanUser(userId) {
            try {
                const response = await ApiAxios.updatePatch(
                    userId,
                    "users",
                    "unban",
                    {}, // Empty body
                    `Bearer ${Cookies.get("token")}`,
                    true, // Allow nulls
                    {}, // Filters
                    {} //
                );
                const user = this.users.find((u) => u.id === userId);
                if (user) user.status = "active";
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            }
        },
        async deleteUser(userId) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.delete(
                    userId,
                    "users",
                    `Bearer ${Cookies.get("token")}`
                );
                // Remove user from local state
                this.users = this.users.filter((u) => u.id !== userId);
                return response;
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
        getUserSearchResults: (state) => state.userSearchResults, // Getter for search results
        getUserSearchLoading: (state) => state.searchIsLoading, // Getter for search loading
        getUsers: (state) => state.users,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getUserDetails: (state) => {
            if (!state.currentUser) return null;
            return {
                ...state.currentUser,
                full_name: `${state.currentUser.first_name} ${state.currentUser.last_name}`,
                addresses: state.currentUser.addresses || [],
                // Add other necessary transformations
            };
        },
    },
});

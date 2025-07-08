import { defineStore } from "pinia";
import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router";
import ApiAxios from "../../api/Api.js";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: Cookies.get("token") || localStorage.getItem("token") || null,
        email: '', // Ensure email is in state for v-model binding
        password: '', // Ensure password is in state for v-model binding
        isLoading: false,
        error: null,
    }),
    actions: {
        // --- Login Action ---
        async login() { // Removed 'credentials' parameter
            this.isLoading = true;
            this.error = null;
            try {
                // Construct credentials from store state
                const credentials = {
                    email: this.email,
                    password: this.password,
                };
                const response = await ApiAxios.store('login', credentials);

                const token = response.data.token;
                if (!token) {
                    throw new Error("Token not found in API response");
                }
                const userData = response.data.user;

                this.token = token;
                this.user = userData;

                Cookies.set("token", token, {
                    expires: 7,
                    secure: window.location.protocol === 'https:', // Ensure this is appropriate for your setup
                    sameSite: "Strict"
                });

                localStorage.setItem("token", token);
                if (userData) {
                    localStorage.setItem("user", JSON.stringify(userData));
                }

                // Clear password from state after successful login for security
                this.password = '';

                router.push("/");
                return response.data;
            } catch (error) {
                console.error("Login failed:", error);
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    this.error = error.response.data?.message || `Login Failed: ${error.response.statusText || 'Server Error'}`;
                } else if (error.request) {
                    // The request was made but no response was received
                    this.error = "Login Failed: No response from server. Please check your network connection.";
                } else {
                    // Something happened in setting up the request that triggered an Error
                    this.error = error.message || "Login Failed: An unexpected error occurred.";
                }
                // Consider if logout is always appropriate on any login error.
                // For 401/403, logout might be needed. For other errors, maybe not.
                // this.logout(); // Re-evaluate if this is needed for all error types
                console.log("Login error details:", this.error);
                throw error; // Re-throw to be caught by the calling component if needed
            } finally {
                this.isLoading = false;
            }
        },

        // --- Logout Action ---
        logout() {
            this.user = null;
            this.token = null;
            this.error = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            Cookies.remove("token");
            delete axios.defaults.headers.common["Authorization"];
            router.replace("/login");
        },

        // --- Check Token Validity Action ---
        async checkTokenValidity() {
            if (!this.token) {
                return false;
            }

            this.isLoading = true;
            this.error = null;

            try {
                const checkEndpoint = 'analytics/overview';
                const response = await ApiAxios.index(checkEndpoint, this.token);

                if (response.data && response.data.data) {
                    this.user = response.data.data;
                    localStorage.setItem("user", JSON.stringify(this.user));
                }

                return true;

            } catch (error) {
                console.error("Token validation failed:", error);
                if (error.response?.status === 401) {
                    this.error = "Session expired. Please log in again.";
                    this.logout();
                } else {
                    this.error = `Failed to verify session (${error.response?.status || 'Network Error'}). Please try again later.`;
                }
                return false;

            } finally {
                this.isLoading = false;
            }
        },

        // --- Initialize Auth Action ---
        initializeAuth() {
            const token = Cookies.get("token") || localStorage.getItem("token");
            const userJson = localStorage.getItem("user");
            if (token) {
                this.token = token;
                if (userJson) {
                    try {
                        this.user = JSON.parse(userJson);
                    } catch (e) {
                        console.error("Failed to parse user data from localStorage", e);
                        localStorage.removeItem("user");
                    }
                }
            }
        }
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user,
        authIsLoading: (state) => state.isLoading,
        authError: (state) => state.error,
    },
});

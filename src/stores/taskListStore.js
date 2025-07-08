import { defineStore } from "pinia";
import ApiAxios from "../../api/Api.js";
import Cookies from "js-cookie";

export const useTaskListStore = defineStore("taskList", {
    state: () => ({
        taskLists: [],
        isLoading: false,
        error: null,
        paginationMeta: null,
        searchIsLoading: false,
        taskListSearchResults: [],

        currentTaskList: null,
        filters: {
            name: '',
        },
        pagination: {
            page: 1,
            perPage: 10
        }
    }),
    actions: {
        async searchTaskListsByName(searchTerm) {
            this.error = null;
            if (!searchTerm || searchTerm.length < 2) {
                this.taskListSearchResults = [];
                return;
            }
            this.searchIsLoading = true;
            try {
                const params = {
                    "filter[name]": searchTerm,
                    per_page: 15,
                };
                const response = await ApiAxios.index(
                    "/task-lists",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );
                this.taskListSearchResults = response.data.data || [];
            } catch (error) {
                console.error("Store: Error searching task lists:", error);
                this.error =
                    error.response?.data?.message || "Failed to search task lists";
                this.taskListSearchResults = [];
            } finally {
                this.searchIsLoading = false;
            }
        },
        async fetchTaskListById(id) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.show(
                    id,
                    "/task-lists",
                    `Bearer ${Cookies.get("token")}`
                );
                this.currentTaskList = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async fetchTaskLists(page = 1, perPage = 10, filters = {}) {
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
                    "/task-lists",
                    `Bearer ${Cookies.get("token")}`,
                    params
                );

                this.taskLists = response.data.data;
                this.paginationMeta = response.data.meta;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
            } finally {
                this.isLoading = false;
            }
        },
        async addTaskList(taskListData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.store(
                    "task-lists",
                    taskListData,
                    `Bearer ${Cookies.get("token")}`
                );
                this.taskLists.push(response.data.data);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async updateTaskList(id, taskListData) {
            try {
                this.isLoading = true;
                const response = await ApiAxios.update(
                    id,
                    "task-lists",
                    null,
                    taskListData,
                    `Bearer ${Cookies.get("token")}`
                );
                const index = this.taskLists.findIndex((tl) => tl.id === id);
                if (index !== -1) {
                    this.taskLists[index] = response.data.data;
                }
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async deleteTaskList(taskListId) {
            try {
                this.isLoading = true;
                await ApiAxios.destroy(
                    taskListId,
                    "task-lists",
                    `Bearer ${Cookies.get("token")}`
                );
                this.taskLists = this.taskLists.filter((tl) => tl.id !== taskListId);
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
        getTaskListSearchResults: (state) => state.taskListSearchResults,
        getTaskListSearchLoading: (state) => state.searchIsLoading,
        getTaskLists: (state) => state.taskLists,
        loadingStatus: (state) => state.isLoading,
        pageCount: (state) => state.paginationMeta?.last_page || 1,
        currentPage: (state) => state.paginationMeta?.current_page || 1,
        getTaskListDetails: (state) => state.currentTaskList,
    },
});

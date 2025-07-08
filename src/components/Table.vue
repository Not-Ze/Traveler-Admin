<template>
  <v-container class="pa-md-12">
    <section>
      <v-card class="pa-4" elevation="2">
        <!-- Dynamic Filters -->
        <v-row v-if="config.filters" class="mb-4 mt-1 rounded-xl " align="end" no-gutters>
          <v-col
            v-for="(filter, index) in config.filters"
            :key="index"
            :cols="12 / config.filters.length"
            class="pa-1"
          >
            <component
              :is="filterComponents[filter.type].component"
              v-model="localFilters[filter.key]"
              v-bind="filter.props"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              :label="filter.label"
              @update:modelValue="emitFilters"
            />
          </v-col>
        </v-row>

        <!-- Loading State -->
        <div v-if="loading" class="my-4">
          <v-progress-linear indeterminate color="primary" />
        </div>

        <!-- Table Content -->
        <v-table v-if="!loading" class="rounded-xl data-table">
          <thead>
            <tr>
              <th
                v-for="(header, index) in processedHeaders"
                :key="index"
                class="pa-4 text-left font-weight-bold"
                :class="header.class"
              >
                {{ header.title }}
              </th>
              <th
                v-if="(config.actions || []).length"
                class="pa-4 text-center font-weight-bold"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="props.items.length > 0">
              <tr
                v-for="(item, index) in paginatedItems"
                :key="item.id || index"
                class="data-table-row"
              >
                <td
                  v-for="(header, hIndex) in processedHeaders"
                  :key="hIndex"
                  class="pa-4"
                  :class="header.class"
                >
                  <template v-if="header.key === '#'">
                    {{ calculateRowNumber(index) }}
                  </template>
                  <template v-else-if="header.key === 'image'">
                    <div class="d-flex align-center">
                      <v-btn
                        v-if="!getNestedValue(item, 'image')"
                        small
                        outlined
                        color="primary"
                        @click.stop="emit('add-image-clicked', item)"
                        class="mr-3"
                      >
                        <v-icon left small>mdi-image-plus</v-icon>
                        ADD IMAGE
                      </v-btn>
                      <v-img
                        v-else
                        :src="getNestedValue(item, 'image')"
                        height="40"
                        width="40"
                        contain
                        class="mr-3"
                      ></v-img>
                      {{ getNestedValue(item, header.key) }}
                    </div>
                  </template>
                    <template v-else-if="header.key === 'rating'">
                    <v-rating
                      :model-value="getNestedValue(item, 'rating')"
                      color="orange-darken-2"
                      density="compact"
                      size="small"
                      readonly
                    ></v-rating>
                    </template>

                  <template v-else-if="header.key === 'status'">
                    <v-chip
                      :color="getStatusColor(getNestedValue(item, header.key))"
                      small
                      label
                      class="font-weight-medium"
                    >
                      {{ getNestedValue(item, header.key) }}
                    </v-chip>
                  </template>

                  <template v-else>
                    <slot :name="`cell-${header.key}`" :item="item">
                      {{ getNestedValue(item, header.key) || "—" }}
                    </slot>
                  </template>
                </td>

                <!-- Actions Column -->
                <td v-if="config.actions?.length" class="pa-4 text-center">
                  <div class="d-flex justify-center gap-2">
                    <template
                      v-for="(action, actionIndex) in config.actions"
                      :key="actionIndex"
                    >
                      <v-btn
                        icon
                        variant="text"
                        :color="action.color || 'primary'"
                        @click.stop="handleAction(action, item)"
                      >
                        <v-icon>{{ action.icon }}</v-icon>
                      </v-btn>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td
                :colspan="
                  processedHeaders.length + (config.actions?.length ? 1 : 0)
                "
                class="py-4 text-center"
              >
                <v-alert color="primary"  outlined class="ma-2">
                  No data available to display
                </v-alert>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination -->
        <v-row
          v-if="config.pagination && pageCount > 1"
          justify="center"
          class="mt-6"
        >
          <v-col cols="auto">
            <v-pagination
              :model-value="currentPage"
              :length="pageCount"
              :total-visible="5"
              @update:modelValue="handlePageChange"
            />
          </v-col>
        </v-row>
      </v-card>
    </section>
  </v-container>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from "vue";
import { VTextField, VSelect } from "vuetify/components";

const filterComponents = {
  text: { component: VTextField, props: ["label", "clearable"] },
  select: { component: VSelect, props: ["label", "items", "clearable"] },
  date: { component: VTextField, props: ["label", "type"] },
};

const props = defineProps({
  title: String,
  items: { type: Array, default: () => [] },
  loading: Boolean,
  config: {
    type: Object,
    default: () => ({
      headers: [],
      filters: [],
      pagination: true,
      actions: [],
    }),
  },
  meta: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
  "add",
  "page-change",
  "filter-change",
  "row-click",
  "action",
  "add-image-clicked",
]);

const currentPage = ref(1);
const localFilters = ref({});

const processedHeaders = computed(() => [
  { key: "#", title: "#", class: "text-left" },
  ...props.config.headers.map((header) => ({
    key: header.key,
    title: header.title,
    class: header.class || "text-left",
  })),
]);

const itemsPerPage = computed(() => props.meta?.per_page || 10);

const pageCount = computed(
  () =>
    props.meta?.last_page || Math.ceil(props.items.length / itemsPerPage.value)
);

const paginatedItems = computed(() => props.items);

const calculateRowNumber = (index) => {
  if (props.config.pagination && props.meta && props.meta.current_page) {
    return (props.meta.current_page - 1) * itemsPerPage.value + index + 1;
  }
  return index + 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  emit("page-change", { page, perPage: itemsPerPage.value });
};

const emitFilters = () => emit("filter-change", { ...localFilters.value });
const handleRowClick = (item) => emit("row-click", item);

const handleAction = (action, item) => {
  if (
    action.confirm &&
    !confirm(
      action.confirmMessage || `Are you sure you want to ${action.label}?`
    )
  )
    return;
  emit("action", { name: action.name, item });
  if (typeof action.action === "function") action.action(item);
};

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj) || "";
const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  return s === "active"
    ? "green lighten-1"
    : s === "banned"
    ? "red lighten-1"
    : s === "pending"
    ? "orange lighten-1"
    : s === "open"
    ? "blue lighten-1"
    : s === "closed"
    ? "grey lighten-1"
    : "blue-grey lighten-1";
};

watch(
  () => props.config.filters,
  (newFilters) => {
    if (newFilters)
      localFilters.value = newFilters.reduce(
        (acc, filter) => ({
          ...acc,
          [filter.key]: localFilters.value[filter.key] || "",
        }),
        {}
      );
  },
  { immediate: true }
);

watch(
  () => props.meta,
  (newMeta) => {
    if (newMeta && newMeta.current_page) {
      currentPage.value = newMeta.current_page;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.custom-data-table :deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

.custom-data-table :deep(th) {
  font-weight: 600 !important;
  color: #616161 !important;
  font-size: 0.875rem !important;
}

.custom-data-table :deep(td) {
  vertical-align: middle;
  padding: 12px 16px !important;
}

.table-image {
  border: 1px solid #eee;
  border-radius: 4px;
}

.v-chip--label {
  min-width: 80px;
  justify-content: center;
}

.table-search-bar {
  max-width: 400px;
}

.custom-data-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>

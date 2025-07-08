<template>
  <v-dialog :model-value="modelValue" @update:model-value="closeDialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="editableCountry.countryName" label="Country Name" required></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
        <v-btn color="blue darken-1" text @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  country: Object,
});

const emit = defineEmits(['update:modelValue', 'save']);

const editableCountry = ref({});

watch(() => props.country, (newVal) => {
  if (newVal) {
    editableCountry.value = { ...newVal };
  } else {
    editableCountry.value = { countryName: '' };
  }
}, { immediate: true });

const formTitle = computed(() => {
  return props.country ? 'Edit Country' : 'Add Country';
});

const closeDialog = () => {
  emit('update:modelValue', false);
};

const save = () => {
  emit('save', editableCountry.value);
  closeDialog();
};
</script>

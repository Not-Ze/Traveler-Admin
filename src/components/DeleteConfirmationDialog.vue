<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500px">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold text-left pb-0" style="padding-bottom: 0;">
        {{ title || `Delete ${itemLabel}` }}
      </v-card-title>
      <v-card-text class="text-left pt-2 pb-0" style="padding-top: 8px; padding-bottom: 0;">
        {{ message || `Are you sure you want to delete this ${itemLabel}${itemName ? ` \"${itemName}\"` : ''}?` }}
      </v-card-text>
      <v-card-actions class="justify-end pt-6" style="padding-top: 24px;">
        <v-btn variant="text" color="grey darken-1" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="red" variant="flat" class="ml-2" @click="confirm">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </template>

<style scoped>
.v-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  text-align: left;
}
.v-card-text {
  text-align: left;
  color: #333;
  font-size: 1rem;
}
.v-card-actions {
  justify-content: flex-end;
}
</style>

<script setup>

defineProps({
  modelValue: Boolean,
  itemName: String,
  itemLabel: {
    type: String,
    default: 'item',
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const confirm = () => {
  emit('confirm');
};
</script>

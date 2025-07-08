<template>
  <v-dialog :model-value="modelValue" persistent max-width="400" @update:model-value="closeDialog">
    <v-card>
      <v-card-title class="text-h5">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey darken-1" text @click="onCancel">Cancel</v-btn>
        <v-btn :color="confirmColor" text @click="onConfirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  confirmColor: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

function closeDialog(value) {
  emit('update:modelValue', value)
}

function onConfirm() {
  emit('confirm');
  closeDialog(false);
}

function onCancel() {
  emit('cancel');
  closeDialog(false);
}
</script>

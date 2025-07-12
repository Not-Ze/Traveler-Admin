<template>
  <VContainer fluid class="ml-4 ">
    <VRow
      align="center"
      class="mb-4"
    >
      <VCol>
        <h1 class="text-h4 font-weight-bold">
          User Details
        </h1>
      </VCol>
      <VCol class="text-right">
        <VBtn
          color="grey-lighten-4"
          class="mr-3"
          flat
          @click="onEdit"
        >
          <span class="text-black font-weight-bold">Edit</span>
        </VBtn>
        <VBtn
          color="error"
          flat
          @click="onDelete"
          class="mr-5"
        >
          Delete
        </VBtn>
      </VCol>
    </VRow>

    <VRow>
      <VCol>
        <h2 class="text-h6 font-weight-medium mb-3 mt-12">
          Information
        </h2>
        <VCard class="pa-2">
          <VCardTitle class="text-h6 font-weight-semibold">
            Basic information
          </VCardTitle>
          <VCardText class="pt-4">
            <VRow v-if="loading">
              <VCol
                v-for="n in 6"
                :key="n"
                cols="12"
                md="4"
              >
                <VSkeletonLoader type="text@2" />
              </VCol>
            </VRow>

            <VRow v-else-if="user">
              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  First name
                </div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ user.name }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  Birth Date
                </div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ user.birth_date }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  Sex
                </div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ user.sex }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  Email
                </div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ user.email }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  User Type
                </div>
                <div class="text-subtitle-1 font-weight-medium">
                  {{ user.user_type }}
                </div>
              </VCol>

              <VCol
                cols="12"
                sm="6"
                md="4"
                class="mb-4"
              >
                <div class="text-grey-darken-1 text-subtitle-2 mb-1">
                  Status
                </div>
                <div>
                  <VChip
                    :color="statusColor"
                    label
                    size="small"
                  >
                    {{ user.status }}
                  </VChip>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <DeleteConfirmationDialog
      v-model="isDeleteDialogOpen"
      :item-name="user?.name"
      @confirm="confirmDelete"
    />
  </VContainer>
</template>
<script setup>
import { useUserStore } from '@/stores/userStore'
import { VSkeletonLoader } from 'vuetify/components'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userId = route.params.id
const isDeleteDialogOpen = ref(false)

const user = computed(() => userStore.currentUser)
const loading = computed(() => userStore.isLoading)
const error = computed(() => userStore.error)

const statusColor = computed(() => {
  if (user.value?.status?.toLowerCase() === 'active') {
    return 'success'
  }
  return 'default'
})

function onEdit() {
  router.push(`/users/${userId}/edit`)
}

function onDelete() {
  isDeleteDialogOpen.value = true
}

async function confirmDelete() {
  await userStore.deleteUser(userId)
  isDeleteDialogOpen.value = false
  if (!userStore.error) {
    router.push('/users')
  }
}

onMounted(() => {
  userStore.fetchUserById(userId)
})
</script>

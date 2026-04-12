<template>
  <div class="role-filter">
    <button
      v-for="role in ROLES"
      :key="role.id"
      class="role-filter__btn"
      :class="{ 'role-filter__btn--active': modelValue === role.id }"
      @click="emit('update:modelValue', role.id)"
    >
      <span class="role-filter__name">{{ role.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ROLES } from '~/src/shared/config/roles'
import type { RoleId } from '~/src/shared/config/roles'

defineProps<{
  modelValue: RoleId
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RoleId]
}>()
</script>

<style scoped>
.role-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.role-filter__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #8a8a9a;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.role-filter__btn:hover {
  background: rgba(200, 155, 60, 0.1);
  border-color: rgba(200, 155, 60, 0.3);
  color: #f0e6d2;
}

.role-filter__btn--active {
  background: rgba(200, 155, 60, 0.15);
  border-color: #c89b3c;
  color: #c89b3c;
}

.role-filter__name {
  font-weight: 500;
}
</style>

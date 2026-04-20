<template>
  <div class="role-filter">
    <button
      v-for="role in ROLES"
      :key="role.id"
      class="role-filter__btn mono"
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--fg);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.1s;
}

.role-filter__btn:hover {
  border-color: var(--acid);
  color: var(--acid);
}

.role-filter__btn--active {
  background: var(--acid);
  border-color: var(--acid);
  color: var(--bg);
}

.role-filter__name {
  font-weight: 600;
}
</style>

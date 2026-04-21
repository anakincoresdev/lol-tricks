<template>
  <div class="search-input">
    <svg
      class="search-input__icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <input
      :value="modelValue"
      type="text"
      class="search-input__field"
      :placeholder="placeholder ?? t('searchInput.placeholder')"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.search-input {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.search-input__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--fg-dim);
  pointer-events: none;
}

.search-input__field {
  width: 100%;
  padding: 12px 16px 12px 42px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--fg);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 500;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input__field::placeholder {
  color: var(--fg-dim);
}

.search-input__field:focus {
  border-color: var(--acid);
}
</style>

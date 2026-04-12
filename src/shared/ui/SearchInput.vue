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
      :placeholder="placeholder"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

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
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a5a6a;
  pointer-events: none;
}

.search-input__field {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.2);
  border-radius: 12px;
  color: #e0e0e0;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

.search-input__field::placeholder {
  color: #5a5a6a;
}

.search-input__field:focus {
  border-color: rgba(200, 155, 60, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.1);
}
</style>

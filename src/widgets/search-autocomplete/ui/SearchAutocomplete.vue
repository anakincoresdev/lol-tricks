<template>
  <div ref="wrapperRef" class="search-ac">
    <div class="search-ac__input-wrapper">
      <svg
        class="search-ac__icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-ac__input"
        placeholder="Поиск чемпиона... например Ари, Yasuo, Зед"
        autocomplete="off"
        @focus="onFocus"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectCurrent"
        @keydown.escape="close"
      />
      <button
        v-if="query.length > 0"
        class="search-ac__clear"
        @click="clearQuery"
      >
        &times;
      </button>
    </div>

    <div v-if="showDropdown && filtered.length > 0" class="search-ac__dropdown">
      <button
        v-for="(champ, i) in filtered"
        :key="champ.id"
        class="search-ac__item"
        :class="{ 'search-ac__item--active': i === activeIndex }"
        @mouseenter="activeIndex = i"
        @click="selectChampion(champ)"
      >
        <img
          :src="getChampionImageUrl(champ.id)"
          :alt="champ.name"
          class="search-ac__item-icon"
          loading="lazy"
        />
        <div class="search-ac__item-info">
          <span class="search-ac__item-name">{{ champ.name }}</span>
          <span class="search-ac__item-id">{{ champ.id }}</span>
        </div>
        <span class="search-ac__item-roles">
          {{ champ.roles.join(', ') }}
        </span>
      </button>
    </div>

    <div
      v-if="showDropdown && query.length >= 1 && filtered.length === 0"
      class="search-ac__dropdown search-ac__dropdown--empty"
    >
      <p>Ничего не найдено</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getChampionImageUrl } from '~/src/shared/config'
import { CHAMPIONS } from '~/src/entities/champion'
import type { ChampionData } from '~/src/entities/champion'

const router = useRouter()

const query = ref('')
const showDropdown = ref(false)
const activeIndex = ref(0)
const wrapperRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 1) return []

  return CHAMPIONS.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    )
  }).slice(0, 8)
})

watch(query, () => {
  activeIndex.value = 0
  showDropdown.value = query.value.trim().length >= 1
})

function onFocus(): void {
  if (query.value.trim().length >= 1) {
    showDropdown.value = true
  }
}

function close(): void {
  showDropdown.value = false
}

function clearQuery(): void {
  query.value = ''
  showDropdown.value = false
  inputRef.value?.focus()
}

function moveDown(): void {
  if (activeIndex.value < filtered.value.length - 1) {
    activeIndex.value++
  }
}

function moveUp(): void {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

function selectChampion(champ: ChampionData): void {
  query.value = ''
  showDropdown.value = false
  router.push(`/champion/${champ.id}`)
}

function selectCurrent(): void {
  const champ = filtered.value[activeIndex.value]
  if (champ) {
    selectChampion(champ)
  }
}

function onClickOutside(event: MouseEvent): void {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.search-ac {
  position: relative;
  width: 100%;
  max-width: 560px;
}

.search-ac__input-wrapper {
  position: relative;
}

.search-ac__icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #5a5a6a;
  pointer-events: none;
}

.search-ac__input {
  width: 100%;
  padding: 16px 48px 16px 56px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.25);
  border-radius: 16px;
  color: #e0e0e0;
  font-size: 1.1rem;
  outline: none;
  transition: all 0.2s;
}

.search-ac__input::placeholder {
  color: #5a5a6a;
}

.search-ac__input:focus {
  border-color: rgba(200, 155, 60, 0.6);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(200, 155, 60, 0.1);
}

.search-ac__clear {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6a6a7a;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}

.search-ac__clear:hover {
  color: #e0e0e0;
}

.search-ac__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #16161e;
  border: 1px solid rgba(200, 155, 60, 0.2);
  border-radius: 14px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.search-ac__dropdown--empty {
  padding: 20px;
  text-align: center;
  color: #5a5a6a;
  font-size: 0.9rem;
}

.search-ac__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.search-ac__item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.search-ac__item--active,
.search-ac__item:hover {
  background: rgba(200, 155, 60, 0.1);
}

.search-ac__item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(200, 155, 60, 0.3);
  flex-shrink: 0;
}

.search-ac__item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.search-ac__item-name {
  font-weight: 600;
  color: #f0e6d2;
}

.search-ac__item-id {
  font-size: 0.8rem;
  color: #6a6a7a;
}

.search-ac__item-roles {
  font-size: 0.8rem;
  color: #6a6a7a;
  white-space: nowrap;
}
</style>

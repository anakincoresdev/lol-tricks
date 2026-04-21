<template>
  <div ref="wrapperRef" class="search-ac">
    <div class="search-ac__bar">
      <span class="search-ac__label mono">
        {{ t('searchAutocomplete.championLabel') }}
      </span>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-ac__input"
        :placeholder="t('searchAutocomplete.placeholder')"
        autocomplete="off"
        @focus="onFocus"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectCurrent"
        @keydown.escape="close"
      />
      <button class="search-ac__submit mono" @click="selectCurrent">
        {{ t('searchAutocomplete.submit') }}
        <span class="search-ac__submit-arrow">→</span>
      </button>
    </div>

    <div v-if="showDropdown && filtered.length > 0" class="search-ac__dropdown">
      <div class="search-ac__dropdown-head mono">
        <span>
          {{ t('searchAutocomplete.resultsCount', { count: filtered.length }) }}
        </span>
        <span>{{ t('searchAutocomplete.enterHint') }}</span>
      </div>
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
          :alt="championDisplayName(champ, locale)"
          class="search-ac__item-icon"
          loading="lazy"
        />
        <div class="search-ac__item-info">
          <span class="search-ac__item-name display">
            {{ championDisplayName(champ, locale) }}
          </span>
          <span class="search-ac__item-id mono">
            {{ champ.roles.join(' · ').toUpperCase() }}
          </span>
        </div>
        <span class="search-ac__item-roles mono">{{ champ.id }}</span>
      </button>
    </div>

    <div
      v-if="showDropdown && query.length >= 1 && filtered.length === 0"
      class="search-ac__dropdown search-ac__dropdown--empty"
    >
      <p>{{ t('common.nothingFound') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { getChampionImageUrl } from '~/src/shared/config'
import { CHAMPIONS, championDisplayName } from '~/src/entities/champion'
import type { ChampionData } from '~/src/entities/champion'
import { useI18n } from '#imports'

const router = useRouter()
const { t, locale } = useI18n()

const query = ref('')
const showDropdown = ref(false)
const activeIndex = ref(0)
const wrapperRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 1) {
    return []
  }

  return CHAMPIONS.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      championDisplayName(c, 'en').toLowerCase().includes(q)
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
  max-width: 720px;
}

.search-ac__bar {
  display: flex;
  align-items: stretch;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 6px;
  padding: 6px;
}

.search-ac__label {
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-size: 12px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-right: 1px solid var(--border);
}

.search-ac__input {
  flex: 1;
  min-width: 0;
  padding: 16px 14px;
  background: transparent;
  border: none;
  color: var(--fg);
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 18px;
  outline: none;
}

.search-ac__input::placeholder {
  color: var(--fg-dim);
  font-weight: 500;
}

.search-ac__submit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  background: var(--acid);
  color: var(--bg);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.search-ac__submit:hover {
  opacity: 0.85;
}

.search-ac__submit-arrow {
  font-size: 16px;
  line-height: 1;
}

.search-ac__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.search-ac__dropdown-head {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border);
}

.search-ac__dropdown--empty {
  padding: 20px;
  text-align: center;
  color: var(--fg-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.search-ac__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: none;
  border: none;
  color: var(--fg);
  font-size: 14px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.search-ac__item:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

.search-ac__item--active,
.search-ac__item:hover {
  background: color-mix(in oklab, var(--acid) 15%, transparent);
}

.search-ac__item-icon {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  flex-shrink: 0;
}

.search-ac__item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.search-ac__item-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--fg);
  letter-spacing: -0.01em;
}

.search-ac__item-id {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.08em;
}

.search-ac__item-roles {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.08em;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .search-ac__label {
    display: none;
  }

  .search-ac__input {
    padding: 12px 14px;
    font-size: 16px;
  }

  .search-ac__submit {
    padding: 12px 16px;
    font-size: 11px;
  }
}
</style>

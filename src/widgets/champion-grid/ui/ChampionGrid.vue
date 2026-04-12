<template>
  <section class="champion-grid">
    <div class="champion-grid__header">
      <h2 class="champion-grid__title">Чемпионы</h2>
      <p class="champion-grid__subtitle">
        Выбери чемпиона, чтобы увидеть билды от лучших OTP
      </p>
    </div>

    <div class="champion-grid__controls">
      <SearchInput v-model="searchQuery" placeholder="Поиск чемпиона..." />
      <RoleFilter v-model="selectedRole" />
    </div>

    <div v-if="filteredChampions.length > 0" class="champion-grid__list">
      <ChampionCard
        v-for="champion in filteredChampions"
        :key="champion.id"
        :champion="champion"
      />
    </div>

    <div v-else class="champion-grid__empty">
      <p>Чемпионы не найдены</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SearchInput, RoleFilter } from '~/src/shared/ui'
import type { RoleId } from '~/src/shared/config'
import { CHAMPIONS, ChampionCard } from '~/src/entities/champion'

const searchQuery = ref('')
const selectedRole = ref<RoleId>('all')

const filteredChampions = computed(() => {
  return CHAMPIONS.filter((champion) => {
    const matchesSearch =
      searchQuery.value === '' ||
      champion.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      champion.id.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesRole =
      selectedRole.value === 'all' ||
      champion.roles.includes(selectedRole.value)

    return matchesSearch && matchesRole
  })
})
</script>

<style scoped>
.champion-grid {
  padding: 3rem 0;
}

.champion-grid__header {
  margin-bottom: 1.5rem;
}

.champion-grid__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f0e6d2;
  margin-bottom: 0.25rem;
}

.champion-grid__subtitle {
  font-size: 0.95rem;
  color: #6a6a7a;
}

.champion-grid__controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.champion-grid__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.champion-grid__empty {
  text-align: center;
  padding: 3rem;
  color: #5a5a6a;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .champion-grid__controls {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
  }

  .champion-grid__list {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }
}
</style>

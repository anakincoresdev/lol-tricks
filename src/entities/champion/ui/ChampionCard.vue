<template>
  <NuxtLink :to="`/champions/${champion.id}`" class="champion-card">
    <div class="champion-card__image-wrapper">
      <img
        :src="getChampionImageUrl(champion.id)"
        :alt="champion.name"
        class="champion-card__image"
        loading="lazy"
      />
    </div>
    <div class="champion-card__info">
      <span class="champion-card__name">{{ champion.name }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ChampionData } from '~/src/entities/champion'
import { getChampionImageUrl } from '~/src/shared/config'

defineProps<{
  champion: ChampionData
}>()
</script>

<style scoped>
.champion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.champion-card:hover {
  background: rgba(200, 155, 60, 0.08);
  border-color: rgba(200, 155, 60, 0.25);
  transform: translateY(-2px);
}

.champion-card__image-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(200, 155, 60, 0.3);
  transition: border-color 0.2s;
}

.champion-card:hover .champion-card__image-wrapper {
  border-color: #c89b3c;
}

.champion-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.champion-card__info {
  text-align: center;
}

.champion-card__name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #c8c8d0;
}

.champion-card:hover .champion-card__name {
  color: #f0e6d2;
}
</style>

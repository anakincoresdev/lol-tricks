<template>
  <NuxtLink :to="`/champions/${champion.id}`" class="champion-card stick">
    <div class="champion-card__image-wrapper">
      <img
        :src="getChampionImageUrl(champion.id)"
        :alt="championDisplayName(champion, locale)"
        class="champion-card__image"
        loading="lazy"
      />
    </div>
    <div class="champion-card__info">
      <span class="champion-card__name display">
        {{ championDisplayName(champion, locale) }}
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ChampionData } from '~/src/entities/champion'
import { championDisplayName } from '~/src/entities/champion'
import { getChampionImageUrl } from '~/src/shared/config'
import { useI18n } from '#imports'

defineProps<{
  champion: ChampionData
}>()

const { locale } = useI18n()
</script>

<style scoped>
.champion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    transform 0.15s;
  text-decoration: none;
}

.champion-card:hover {
  border-color: var(--acid);
  transform: translateY(-2px);
}

.champion-card__image-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid var(--border);
  transition: border-color 0.15s;
}

.champion-card:hover .champion-card__image-wrapper {
  border-color: var(--acid);
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
  font-size: 13px;
  font-weight: 600;
  color: var(--fg);
}
</style>

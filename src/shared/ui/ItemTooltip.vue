<template>
  <span
    ref="triggerEl"
    class="item-tooltip"
    :style="sizeStyle"
    @mouseenter="onOpen"
    @mouseleave="onClose"
    @focusin="onOpen"
    @focusout="onClose"
  >
    <img
      :src="getItemImageUrl(itemId)"
      :alt="info?.name ?? `item ${itemId}`"
      class="item-tooltip__icon"
      loading="lazy"
    />

    <!-- Teleported to <body> so the tooltip isn't clipped by the
         table-wrapper's overflow. Positioned via JS-computed fixed
         coordinates anchored to the trigger's bounding rect. -->
    <Teleport to="body">
      <span
        v-if="open && info"
        class="item-tooltip__card"
        role="tooltip"
        :style="cardStyle"
      >
        <span class="item-tooltip__header">
          <img
            :src="getItemImageUrl(itemId)"
            :alt="info.name"
            class="item-tooltip__header-icon"
            loading="lazy"
          />
          <span class="item-tooltip__header-meta">
            <span class="item-tooltip__name">{{ info.name }}</span>
            <span v-if="info.gold.total > 0" class="item-tooltip__gold mono">
              {{ info.gold.total }}g
            </span>
          </span>
        </span>
        <!-- Riot's `description` is trusted HTML from DDragon with
             custom tags (<mainText>, <attention>, <stats>, etc.)
             styled below. Safe to v-html — DDragon is Riot's static
             CDN, not user input. -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="item-tooltip__body" v-html="info.description" />
        <span v-if="info.tags.length > 0" class="item-tooltip__tags">
          <span
            v-for="tag in info.tags"
            :key="tag"
            class="item-tooltip__tag mono"
          >
            {{ tag }}
          </span>
        </span>
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getItemImageUrl, loadItemsMap, resolveItemInfo } from '../config'
import type { ItemInfo } from '../config'

const props = withDefaults(
  defineProps<{
    itemId: number
    size?: number
  }>(),
  { size: 28 },
)

// Module-scope cache ref so every instance shares the resolved map.
// `loadItemsMap` itself dedupes the HTTP request; this ref just gives
// Vue a reactive handle to re-render when the data lands.
const itemsMap = ref<Map<number, ItemInfo> | null>(null)

const triggerEl = ref<HTMLElement | null>(null)
const open = ref(false)
// Fixed-position coordinates of the tooltip card. Recomputed every
// time the trigger is hovered so the card tracks scroll/resize changes
// that happened while the user was elsewhere.
const coords = ref<{ top: number; left: number } | null>(null)

const sizeStyle = computed<Record<string, string>>(() => ({
  '--item-tooltip-size': `${props.size}px`,
}))

const cardStyle = computed<Record<string, string>>(() => {
  if (!coords.value) return { visibility: 'hidden' }
  return {
    top: `${coords.value.top}px`,
    left: `${coords.value.left}px`,
  }
})

const info = computed<ItemInfo | null>(() =>
  resolveItemInfo(itemsMap.value, props.itemId),
)

function computeCoords(): void {
  const el = triggerEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  // Anchor bottom-edge of the tooltip 8px above the trigger; center
  // horizontally on the trigger. The card uses translate(-50%, -100%)
  // in CSS to resolve those anchors into top-left fixed coordinates.
  coords.value = {
    top: rect.top - 8,
    left: rect.left + rect.width / 2,
  }
}

function onOpen(): void {
  computeCoords()
  open.value = true
}

function onClose(): void {
  open.value = false
}

// Scroll / resize while the tooltip is open should either move it or
// close it. Cheapest correct behaviour: close on scroll, the user can
// re-hover to reopen at the new position.
function onScroll(): void {
  if (open.value) open.value = false
}

onMounted(() => {
  if (!itemsMap.value) {
    loadItemsMap()
      .then((map) => {
        itemsMap.value = map
      })
      .catch((e: unknown) => {
        // Tooltip just falls back to "no info" — icon still renders.
        console.warn('[items] failed to load item.json', e)
      })
  }
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, { capture: true })
  window.removeEventListener('resize', onScroll)
})
</script>

<style scoped>
.item-tooltip {
  position: relative;
  display: inline-block;
  width: var(--item-tooltip-size, 28px);
  height: var(--item-tooltip-size, 28px);
  vertical-align: middle;
}

.item-tooltip__icon {
  width: 100%;
  height: 100%;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: var(--bg-2);
  display: block;
}

/* The card is teleported to <body>, so scoped styles only reach it
   via :deep() — but Vue's scoped-style hashing is applied to the
   generated elements inside the teleport target too. Keep the card
   rules non-deep; Vue copies the scope hash to teleported markup. */
.item-tooltip__card {
  position: fixed;
  z-index: 1000;
  transform: translate(-50%, -100%);
  min-width: 280px;
  max-width: 340px;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  text-align: left;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  line-height: 1.45;
  color: var(--fg);
  white-space: normal;
}

.item-tooltip__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.item-tooltip__header-icon {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: var(--bg-2);
  flex-shrink: 0;
}

.item-tooltip__header-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-tooltip__name {
  font-weight: 700;
  font-size: 14px;
  color: var(--fg);
}

.item-tooltip__gold {
  color: var(--acid);
  font-size: 11px;
  font-weight: 600;
}

.item-tooltip__body {
  display: block;
  color: var(--fg-dim);
  font-size: 12px;
}

/* DDragon description markup — Riot uses custom tags. :deep() is
   required to reach the v-html'd descendants from a scoped style. */
.item-tooltip__body :deep(mainText) {
  display: block;
}

.item-tooltip__body :deep(stats) {
  display: block;
  margin-bottom: 6px;
  color: var(--fg);
  font-weight: 500;
}

.item-tooltip__body :deep(attention),
.item-tooltip__body :deep(scaleAD),
.item-tooltip__body :deep(scaleAP),
.item-tooltip__body :deep(scaleLevel),
.item-tooltip__body :deep(scaleMana),
.item-tooltip__body :deep(scaleHealth),
.item-tooltip__body :deep(scaleArmor),
.item-tooltip__body :deep(scaleMR) {
  color: var(--fg);
  font-weight: 700;
}

.item-tooltip__body :deep(physicalDamage) {
  color: var(--red);
  font-weight: 600;
}

.item-tooltip__body :deep(magicDamage) {
  color: var(--mag);
  font-weight: 600;
}

.item-tooltip__body :deep(trueDamage) {
  color: var(--fg);
  font-weight: 700;
}

.item-tooltip__body :deep(healing),
.item-tooltip__body :deep(lifeSteal) {
  color: var(--acid);
  font-weight: 600;
}

.item-tooltip__body :deep(shield) {
  color: var(--cyan);
  font-weight: 600;
}

.item-tooltip__body :deep(active) {
  color: var(--acid);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.item-tooltip__body :deep(passive),
.item-tooltip__body :deep(rarityMythic),
.item-tooltip__body :deep(rarityLegendary) {
  color: var(--cyan);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.item-tooltip__body :deep(keywordStealth) {
  color: var(--fg-dim);
  font-style: italic;
}

.item-tooltip__body :deep(li) {
  display: block;
  margin-top: 6px;
  padding-left: 8px;
  border-left: 2px solid var(--border);
}

.item-tooltip__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.item-tooltip__tag {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid var(--border);
  color: var(--fg-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>

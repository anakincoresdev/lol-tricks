<template>
  <div class="legal-page dotted-bg">
    <div class="legal-page__container">
      <NuxtLink to="/" class="legal-page__back mono">
        {{ t('common.back') }}
      </NuxtLink>

      <header class="legal-page__header">
        <span class="legal-page__kicker mono">
          {{ t('legal.privacy.kicker') }}
        </span>
        <h1 class="legal-page__title display">
          {{ t('legal.privacy.title') }}
        </h1>
        <p class="legal-page__meta mono">
          {{ t('legal.effective', { date: '[EFFECTIVE_DATE]' }) }}
        </p>
      </header>

      <article v-if="locale === 'ru'" class="legal-page__body">
        <p class="legal-page__lead">
          Этот документ описывает, какие данные обрабатывает сервис
          <strong>LoL Tricks</strong>
          (далее — «Сервис»), расположенный по адресу [SITE_URL], и как вы
          можете на это повлиять. Оператором данных выступает
          <strong>[OWNER_NAME]</strong>
          (далее — «мы»).
        </p>

        <section class="legal-page__section">
          <h2>1. Какие данные мы обрабатываем</h2>
          <p>
            Сервис не требует регистрации, не запрашивает у посетителя
            персональные данные и не использует формы сбора информации. Мы
            обрабатываем только те данные, которые необходимы для работы сайта:
          </p>
          <ul>
            <li>
              <strong>Игровые данные League of Legends</strong>
              — обезличенный идентификатор игрока (PUUID), игровой никнейм (Riot
              ID), регион, текущий ранг и LP, история ранговых матчей за
              последние 60 дней (пул чемпионов, счёт, роль, предметы, руны). Эти
              данные мы получаем из публичного Riot Games API и кэшируем на
              бэкенде.
            </li>
            <li>
              <strong>Языковая настройка</strong>
              — выбранный язык интерфейса сохраняется в cookie
              <code>i18n_redirected</code>
              . Это техническая (essential) cookie, необходимая для работы
              переключателя языка.
            </li>
            <li>
              <strong>Технические логи сервера</strong>
              — IP-адрес и User-Agent посещающего браузера фиксируются в логах
              нашего хостинг-провайдера (Vercel) для ограничения количества
              запросов (rate limiting) и диагностики инцидентов.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>2. Цели и правовое основание</h2>
          <p>
            Игровые данные отображаются, чтобы показывать рейтинг одно-чемпов
            (one-trick players), их статистику и билды. Правовое основание
            обработки — наш законный интерес в предоставлении аналитического
            сервиса на основе публичной игровой статистики, которую сам Riot
            Games делает доступной через свой API и официальные клиенты.
          </p>
          <p>
            Языковая cookie и технические логи обрабатываются на основании
            законного интереса в корректной работе и защите сервиса.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Третьи стороны</h2>
          <p>
            Мы не продаём и не передаём ваши данные рекламным сетям. Для работы
            сервиса используются следующие обработчики:
          </p>
          <ul>
            <li>
              <strong>Riot Games, Inc.</strong>
              — источник игровых данных. Запросы к Riot API идут только с нашего
              бэкенда и не содержат идентификаторов посетителя сайта.
            </li>
            <li>
              <strong>Vercel Inc.</strong>
              — хостинг фронтенда и бэкенд-API. Vercel автоматически сохраняет
              технические логи (IP, User-Agent, путь запроса) в течение
              короткого срока.
            </li>
            <li>
              <strong>Neon (Neon Inc.)</strong>
              — управляемый PostgreSQL, в котором хранится кэш игровых данных.
              База расположена в ЕС (eu-central-1).
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>4. Cookies</h2>
          <p>
            Сейчас сайт использует только одну essential cookie
            <code>i18n_redirected</code>
            для запоминания выбранного языка. Она не отслеживает вашу активность
            и не передаётся третьим сторонам. Вы можете удалить её в настройках
            браузера — тогда сайт при следующем визите откроется на языке по
            умолчанию (английский).
          </p>
          <p>
            В будущем мы планируем подключить веб-аналитику. Если это
            произойдёт, мы обновим данную политику, укажем конкретного
            провайдера и, при необходимости, добавим запрос согласия до
            установки соответствующих cookie.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Хранение данных</h2>
          <ul>
            <li>
              Данные матчей хранятся в скользящем окне последних 60 дней и
              автоматически вытесняются более свежими.
            </li>
            <li>
              Снапшот игрока (никнейм, регион, ранг, LP) обновляется
              периодически и не хранится исторически — актуальная версия
              затирает предыдущую.
            </li>
            <li>
              Технические логи Vercel хранятся в соответствии с политикой
              провайдера (обычно до 30 дней).
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>6. Ваши права</h2>
          <p>
            Поскольку Сервис работает с обезличенной публичной игровой
            статистикой, при большинстве визитов мы не обрабатываем данных,
            которые однозначно идентифицируют именно вас как частное лицо. Тем
            не менее:
          </p>
          <ul>
            <li>
              Если вы являетесь игроком LoL, чей Riot ID отображается в Сервисе,
              вы можете запросить удаление ваших данных из нашего кэша — для
              этого напишите на [CONTACT_EMAIL].
            </li>
            <li>
              Вы можете запросить информацию о том, какие данные о вас хранятся,
              и получить их копию.
            </li>
            <li>
              Обратите внимание: удаление данных из нашего кэша не удаляет их из
              Riot Games — это можно сделать только через Riot Support.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>7. Дети</h2>
          <p>
            Сервис не ориентирован на лиц младше 13 лет и не собирает
            сознательно данные о детях. Если вы считаете, что данные ребёнка
            оказались в нашем кэше и должны быть удалены, свяжитесь с нами.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>8. Передача данных за рубеж</h2>
          <p>
            Наши обработчики (Vercel, Neon, Riot Games) могут обрабатывать
            данные на серверах за пределами вашей страны. Мы выбираем
            провайдеров, которые заявляют соответствие общепризнанным стандартам
            защиты данных.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>9. Изменения политики</h2>
          <p>
            Мы можем обновлять эту политику. Дата «Действует с» в шапке
            документа всегда отражает текущую версию. Существенные изменения мы
            будем стараться обозначать заметно.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>10. Контакты</h2>
          <p>
            По вопросам, связанным с данными и этой политикой, пишите на
            <a href="mailto:[CONTACT_EMAIL]">[CONTACT_EMAIL]</a>
            .
          </p>
        </section>

        <p class="legal-page__disclaimer mono">
          {{ t('legal.notAffiliated') }}
        </p>
      </article>

      <article v-else class="legal-page__body">
        <p class="legal-page__lead">
          This document describes what data the
          <strong>LoL Tricks</strong>
          service (the &ldquo;Service&rdquo;), available at [SITE_URL],
          processes and how you can control it. The data controller is
          <strong>[OWNER_NAME]</strong>
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>

        <section class="legal-page__section">
          <h2>1. What we process</h2>
          <p>
            The Service has no sign-up, no personal forms and no account system.
            We only process what is strictly necessary to operate the site:
          </p>
          <ul>
            <li>
              <strong>League of Legends game data</strong>
              — a pseudonymous player identifier (PUUID), in-game Riot ID,
              region, current rank and LP, and ranked match history for the last
              60 days (champion pool, score, role, items, runes). This data is
              obtained from the public Riot Games API and cached on our backend.
            </li>
            <li>
              <strong>Language preference</strong>
              — your chosen UI language is stored in the
              <code>i18n_redirected</code>
              cookie. It is essential and used only to keep the language
              switcher consistent between visits.
            </li>
            <li>
              <strong>Server technical logs</strong>
              — your IP address and User-Agent are recorded by our hosting
              provider (Vercel) for rate limiting and troubleshooting.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>2. Purposes and legal basis</h2>
          <p>
            Game data is displayed to power rankings of one-trick players, their
            statistics and builds. The legal basis is our legitimate interest in
            offering an analytics service on top of public game data that Riot
            Games itself makes available through its API and official clients.
          </p>
          <p>
            The language cookie and server logs are processed on the basis of
            our legitimate interest in keeping the Service operational and
            secure.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Third parties</h2>
          <p>
            We do not sell your data and do not share it with advertising
            networks. The Service relies on the following processors:
          </p>
          <ul>
            <li>
              <strong>Riot Games, Inc.</strong>
              — source of game data. Our backend is the only party that talks to
              the Riot API and no visitor identifiers are forwarded in those
              requests.
            </li>
            <li>
              <strong>Vercel Inc.</strong>
              — hosting for the frontend and the backend API. Vercel retains
              technical logs (IP, User-Agent, request path) for a short period.
            </li>
            <li>
              <strong>Neon (Neon Inc.)</strong>
              — managed PostgreSQL where we cache game data. The database is
              hosted in the EU (eu-central-1).
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>4. Cookies</h2>
          <p>
            The Service currently uses a single essential cookie,
            <code>i18n_redirected</code>
            , to remember your chosen language. It does not track you and is not
            shared with third parties. You can delete it via your browser; on
            the next visit the site will fall back to the default language
            (English).
          </p>
          <p>
            We may introduce web analytics in the future. If we do, we will
            update this policy, name the provider and, where appropriate, add a
            consent prompt before any non-essential cookies are set.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Data retention</h2>
          <ul>
            <li>
              Match data is stored on a rolling 60-day window and is
              automatically replaced by newer matches.
            </li>
            <li>
              A player snapshot (Riot ID, region, rank, LP) is refreshed
              periodically and stored as a single current value — we do not keep
              a history of previous snapshots.
            </li>
            <li>
              Technical Vercel logs follow the provider&rsquo;s retention
              (typically up to 30 days).
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>6. Your rights</h2>
          <p>
            Because the Service works with pseudonymous public game statistics,
            most visits do not involve processing of data that uniquely
            identifies you as a private person. That said:
          </p>
          <ul>
            <li>
              If you are a LoL player whose Riot ID appears in the Service, you
              may ask us to delete your data from our cache by writing to
              [CONTACT_EMAIL].
            </li>
            <li>You may request a copy of data we hold about you.</li>
            <li>
              Please note: deleting data from our cache does not delete it from
              Riot Games — that is only possible via Riot Support.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>7. Children</h2>
          <p>
            The Service is not directed at people under 13, and we do not
            knowingly collect data about children. If you believe a
            child&rsquo;s data is present in our cache and should be removed,
            please contact us.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>8. International transfers</h2>
          <p>
            Our processors (Vercel, Neon, Riot Games) may handle data on servers
            outside your country. We pick providers that publicly commit to
            mainstream data-protection standards.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>9. Changes to this policy</h2>
          <p>
            We may update this policy. The &ldquo;Effective&rdquo; date at the
            top of the page always reflects the current version. We will try to
            mark material changes prominently.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>10. Contact</h2>
          <p>
            For any data- or policy-related questions, please write to
            <a href="mailto:[CONTACT_EMAIL]">[CONTACT_EMAIL]</a>
            .
          </p>
        </section>

        <p class="legal-page__disclaimer mono">
          {{ t('legal.notAffiliated') }}
        </p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n, useHead } from '#imports'

const { t, locale } = useI18n()

useHead({
  title: () => `${t('legal.privacy.title')} — LoL Tricks`,
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  padding: 24px 24px 96px;
}

.legal-page__container {
  max-width: 760px;
  margin: 0 auto;
}

.legal-page__back {
  display: inline-block;
  margin-bottom: 32px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--fg-dim);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-decoration: none;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.legal-page__back:hover {
  color: var(--acid);
  border-color: var(--acid);
}

.legal-page__header {
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.legal-page__kicker {
  display: inline-block;
  margin-bottom: 16px;
  padding: 4px 8px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  color: var(--acid);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.legal-page__title {
  font-size: 48px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--fg);
  margin-bottom: 16px;
}

.legal-page__meta {
  font-size: 11px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.legal-page__body {
  color: var(--fg);
  font-size: 15px;
  line-height: 1.7;
}

.legal-page__lead {
  margin-bottom: 32px;
  padding: 16px 20px;
  border-left: 2px solid var(--acid);
  background: var(--bg-2);
  color: var(--fg);
}

.legal-page__section {
  margin-bottom: 32px;
}

.legal-page__section h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--fg);
  margin-bottom: 12px;
}

.legal-page__section p {
  color: var(--fg-dim);
  margin-bottom: 12px;
}

.legal-page__section p:last-child {
  margin-bottom: 0;
}

.legal-page__section ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legal-page__section li {
  position: relative;
  padding-left: 20px;
  color: var(--fg-dim);
}

.legal-page__section li::before {
  content: '›';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--mag);
  font-weight: 700;
}

.legal-page__section strong {
  color: var(--fg);
  font-weight: 600;
}

.legal-page__section a {
  color: var(--cyan);
  text-decoration: none;
  border-bottom: 1px dotted var(--cyan);
}

.legal-page__section a:hover {
  color: var(--acid);
  border-color: var(--acid);
}

.legal-page__section code {
  padding: 1px 6px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--cyan);
}

.legal-page__disclaimer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--fg-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  text-align: center;
}

@media (max-width: 640px) {
  .legal-page__title {
    font-size: 36px;
  }

  .legal-page__section h2 {
    font-size: 18px;
  }
}
</style>

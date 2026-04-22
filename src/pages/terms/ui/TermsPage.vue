<template>
  <div class="legal-page dotted-bg">
    <div class="legal-page__container">
      <NuxtLink to="/" class="legal-page__back mono">
        {{ t('common.back') }}
      </NuxtLink>

      <header class="legal-page__header">
        <span class="legal-page__kicker mono">
          {{ t('legal.terms.kicker') }}
        </span>
        <h1 class="legal-page__title display">
          {{ t('legal.terms.title') }}
        </h1>
        <p class="legal-page__meta mono">
          {{ t('legal.effective', { date: '[EFFECTIVE_DATE]' }) }}
        </p>
      </header>

      <article v-if="locale === 'ru'" class="legal-page__body">
        <p class="legal-page__lead">
          Настоящие Условия регулируют использование сервиса
          <strong>LoL Tricks</strong>
          (далее — «Сервис»), размещённого по адресу [SITE_URL]. Сервис
          предоставляется физическим лицом
          <strong>[OWNER_NAME]</strong>
          (далее — «мы»). Используя Сервис, вы подтверждаете, что прочитали и
          принимаете настоящие Условия. Если вы не согласны — пожалуйста, не
          используйте Сервис.
        </p>

        <section class="legal-page__section">
          <h2>1. Что делает Сервис</h2>
          <p>
            LoL Tricks — это информационный сайт, который отображает
            агрегированную публичную статистику игроков League of Legends уровня
            Master и выше: рейтинг одно-чемпов, их билды, руны, порядок
            предметов и win rate на конкретных чемпионах. Данные получаются из
            публичного Riot Games API и показываются в ознакомительных и
            обучающих целях.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>2. Статус относительно Riot Games</h2>
          <p>
            Сервис
            <strong>не связан, не аффилирован и не одобрен</strong>
            компанией Riot Games, Inc. League of Legends, а также все названия
            чемпионов, способностей, предметов, иллюстрации и логотипы являются
            собственностью Riot Games. Мы используем эти материалы в рамках
            публичного API Riot и общего принципа fair use для отображения
            статистики; право собственности на эти материалы Сервис не получает
            и не передаёт.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Допустимое использование</h2>
          <p>
            Сервис предоставляется бесплатно для личного, некоммерческого
            использования. Вам разрешено:
          </p>
          <ul>
            <li>Просматривать статистику игроков и чемпионов;</li>
            <li>Делиться ссылками на страницы Сервиса;</li>
            <li>Использовать сведения в образовательных целях.</li>
          </ul>
          <p>Вам запрещено:</p>
          <ul>
            <li>
              Автоматически скрейпить контент, обходить rate limit, использовать
              краулеры или ботов без нашего письменного согласия;
            </li>
            <li>
              Перепродавать доступ к данным Сервиса или выдавать их за
              собственные;
            </li>
            <li>
              Использовать Сервис для атак, нарушения работы инфраструктуры,
              получения несанкционированного доступа к бэкенду или БД;
            </li>
            <li>
              Использовать Сервис так, чтобы это нарушало условия использования
              Riot Games или любое применимое законодательство.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>4. Точность данных</h2>
          <p>
            Данные обновляются периодически и отражают состояние Riot API на
            момент последнего обновления. Возможны расхождения с текущей
            картиной в клиенте игры (задержка до нескольких минут, иногда
            дольше). Сервис предоставляется &laquo;как есть&raquo; (
            <em>as is</em>
            ) — мы не гарантируем полноту, актуальность или пригодность данных
            для какой-либо конкретной цели.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Интеллектуальная собственность</h2>
          <p>
            Код, дизайн и тексты Сервиса, созданные нами, принадлежат
            <strong>[OWNER_NAME]</strong>
            . Всё, что относится к League of Legends (образы, названия, ассеты),
            принадлежит Riot Games. Вы можете свободно цитировать небольшие
            фрагменты страниц Сервиса с указанием источника, но не вправе
            копировать сайт целиком или создавать производные сервисы без
            отдельного разрешения.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>6. Отсутствие гарантий</h2>
          <p>
            Мы прилагаем разумные усилия, чтобы Сервис работал стабильно, но не
            гарантируем бесперебойную работу, отсутствие ошибок, полноту данных
            или их пригодность для принятия каких-либо решений (игровых,
            финансовых или иных). Сервис носит исключительно информационный
            характер.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>7. Ограничение ответственности</h2>
          <p>
            В максимально допустимом применимым правом объёме мы не несём
            ответственности за косвенные убытки, упущенную выгоду или
            репутационный ущерб, возникшие в результате использования или
            невозможности использования Сервиса. Наша общая ответственность
            ограничена суммой, уплаченной вами за Сервис — то есть, по общему
            правилу, нулём, поскольку Сервис бесплатен.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>8. Изменения Сервиса и Условий</h2>
          <p>
            Мы можем в любой момент менять Сервис, добавлять или удалять
            функциональность, временно останавливать работу на обслуживание.
            Условия могут обновляться; актуальная версия всегда размещена на
            этой странице, дата последнего изменения указана в шапке.
            Продолжение использования Сервиса после обновления Условий означает
            согласие с новой редакцией.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>9. Прекращение доступа</h2>
          <p>
            Мы оставляем за собой право ограничить или прекратить ваш доступ к
            Сервису в случае нарушения настоящих Условий — без предварительного
            уведомления и без возврата каких-либо средств.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>10. Применимое право</h2>
          <p>
            К настоящим Условиям применяется право страны постоянного проживания
            владельца Сервиса. Споры, по возможности, разрешаются путём
            переговоров по адресу, указанному в разделе «Контакты».
          </p>
        </section>

        <section class="legal-page__section">
          <h2>11. Контакты</h2>
          <p>
            По вопросам, связанным с Сервисом или настоящими Условиями, пишите
            на
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
          These Terms govern your use of the
          <strong>LoL Tricks</strong>
          service (the &ldquo;Service&rdquo;), available at [SITE_URL]. The
          Service is operated by
          <strong>[OWNER_NAME]</strong>
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the Service, you
          confirm that you have read and accept these Terms. If you do not
          agree, please do not use the Service.
        </p>

        <section class="legal-page__section">
          <h2>1. What the Service does</h2>
          <p>
            LoL Tricks is an informational website that surfaces aggregated
            public statistics of League of Legends players at Master tier and
            above: a one-trick leaderboard, builds, runes, item orders and
            per-champion win rates. Data is retrieved from the public Riot Games
            API and is shown for educational and informational purposes.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>2. Relationship to Riot Games</h2>
          <p>
            The Service is
            <strong>not affiliated with, endorsed by or sponsored by</strong>
            Riot Games, Inc. League of Legends, along with all champion, ability
            and item names, artwork and logos, are the property of Riot Games.
            We use those materials under Riot&rsquo;s public API terms and
            general fair-use principles solely to display statistics — the
            Service does not gain, claim or transfer ownership of any such
            materials.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>3. Acceptable use</h2>
          <p>
            The Service is provided free of charge for personal, non-commercial
            use. You may:
          </p>
          <ul>
            <li>Browse player and champion statistics;</li>
            <li>Share links to pages on the Service;</li>
            <li>Use the information for educational purposes.</li>
          </ul>
          <p>You may not:</p>
          <ul>
            <li>
              Scrape the content, bypass rate limits, or use crawlers or bots
              without our written permission;
            </li>
            <li>Resell access to Service data or present it as your own;</li>
            <li>
              Use the Service to attack or disrupt the infrastructure, or gain
              unauthorized access to the backend or database;
            </li>
            <li>
              Use the Service in a way that breaches Riot Games&rsquo; own terms
              of service or any applicable law.
            </li>
          </ul>
        </section>

        <section class="legal-page__section">
          <h2>4. Accuracy of data</h2>
          <p>
            Data is refreshed periodically and reflects the state of the Riot
            API at the time of the last refresh. Small lags compared to the live
            game client are normal. The Service is provided &ldquo;
            <em>as is</em>
            &rdquo; — we make no warranty as to the completeness, timeliness or
            fitness of the data for any particular purpose.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>5. Intellectual property</h2>
          <p>
            The code, design and original text of the Service authored by us
            belong to
            <strong>[OWNER_NAME]</strong>
            . Anything relating to League of Legends (artwork, names, assets)
            belongs to Riot Games. You may quote short excerpts from Service
            pages with attribution, but you may not copy the Service as a whole
            or build derivative services without separate written permission.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>6. No warranty</h2>
          <p>
            We take reasonable care to keep the Service working, but we do not
            guarantee uninterrupted availability, absence of bugs, completeness
            of the data or its suitability for decision-making (whether in-game,
            financial or otherwise). The Service is for informational purposes
            only.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by applicable law, we are not liable
            for indirect damages, lost profits or reputational harm arising out
            of your use of, or inability to use, the Service. Our aggregate
            liability is capped at the amount you have paid us for the Service —
            which, as a general rule, is zero, because the Service is free.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>8. Changes to the Service and Terms</h2>
          <p>
            We may change the Service at any time — adding or removing features,
            or pausing it for maintenance. These Terms may also be updated; the
            current version always lives on this page, with the last-modified
            date shown in the header. Continued use of the Service after an
            update means you accept the new version.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>9. Termination</h2>
          <p>
            We may restrict or terminate your access to the Service if you
            breach these Terms — without prior notice and without any refund.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>10. Governing law</h2>
          <p>
            These Terms are governed by the law of the country of residence of
            the Service owner. Disputes should, where possible, be resolved via
            the contact address below.
          </p>
        </section>

        <section class="legal-page__section">
          <h2>11. Contact</h2>
          <p>
            For any questions about the Service or these Terms, please write to
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
  title: () => `${t('legal.terms.title')} — LoL Tricks`,
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

.legal-page__section em {
  color: var(--fg);
  font-style: italic;
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

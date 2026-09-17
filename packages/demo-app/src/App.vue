<script setup lang="ts">
import { ref } from 'vue';
import {
  PrivateCaptcha,
  type PrivateCaptchaEventDetail,
  type PrivateCaptchaExposed,
} from '@private-captcha/private-captcha-vue';

const publicTestSiteKey = 'aaaaaaaabbbbccccddddeeeeeeeeeeee';
const siteKey = import.meta.env.VITE_PRIVATE_CAPTCHA_SITE_KEY
  || publicTestSiteKey;
const captcha = ref<PrivateCaptchaExposed | null>(null);
const events = ref<string[]>([]);
const solution = ref<string | null>(null);
const theme = ref<'light' | 'dark'>('light');
const startMode = ref<'auto' | 'click'>('auto');
const displayMode = ref<'widget' | 'popup' | 'hidden'>('widget');
const lang = ref<'auto' | 'en' | 'de' | 'fr'>('auto');
const debug = ref(false);
const eu = ref(false);
const fieldName = ref('private-captcha-solution');

function record(name: string, detail: PrivateCaptchaEventDetail): void {
  events.value.unshift(name);
  if (name === 'finish') solution.value = detail.widget.solution();
}

function readSolution(): void {
  solution.value = captcha.value?.solution() ?? null;
}
</script>

<template>
  <main class="demo-shell">
    <header>
      <p class="eyebrow">
        Vue integration test bench
      </p>
      <h1>Private Captcha</h1>
      <p class="intro">
        Change the widget configuration, trigger its public methods, and inspect
        lifecycle events without leaving the page.
      </p>
    </header>

    <div class="demo-grid">
      <section
        class="panel controls"
        aria-labelledby="configuration-heading"
      >
        <h2 id="configuration-heading">
          Configuration
        </h2>

        <label>
          Theme
          <select v-model="theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label>
          Start mode
          <select v-model="startMode">
            <option value="auto">Auto</option>
            <option value="click">Click</option>
          </select>
        </label>

        <label>
          Display mode
          <select v-model="displayMode">
            <option value="widget">Widget</option>
            <option value="popup">Popup</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>

        <label>
          Language
          <select v-model="lang">
            <option value="auto">Automatic</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </label>

        <label>
          Solution field name
          <input
            v-model="fieldName"
            type="text"
          >
        </label>

        <label class="check-control">
          <input
            v-model="debug"
            type="checkbox"
          >
          Debug output
        </label>

        <label class="check-control">
          <input
            v-model="eu"
            type="checkbox"
          >
          EU endpoints
        </label>
      </section>

      <section
        class="panel preview"
        aria-labelledby="preview-heading"
      >
        <h2 id="preview-heading">
          Widget preview
        </h2>

        <form @submit.prevent>
          <div class="private-captcha-anchor">
            <PrivateCaptcha
              ref="captcha"
              :site-key="siteKey"
              :theme="theme"
              :start-mode="startMode"
              :display-mode="displayMode"
              :lang="lang"
              :debug="debug"
              :eu="eu"
              :field-name="fieldName"
              @init="record('init', $event)"
              @start="record('start', $event)"
              @finish="record('finish', $event)"
              @error="record('error', $event)"
              @reset="record('reset', $event)"
            />
          </div>

          <div class="actions">
            <button
              type="button"
              @click="captcha?.execute()"
            >
              Execute
            </button>
            <button
              type="button"
              @click="captcha?.reset()"
            >
              Reset
            </button>
            <button
              type="button"
              @click="readSolution"
            >
              Read solution
            </button>
          </div>
        </form>

        <p class="solution">
          <span>Solution</span>
          <code>{{ solution ?? 'none' }}</code>
        </p>
      </section>

      <section
        class="panel event-panel"
        aria-labelledby="events-heading"
      >
        <div class="event-heading">
          <h2 id="events-heading">
            Events
          </h2>
          <button
            v-if="events.length"
            type="button"
            @click="events = []"
          >
            Clear
          </button>
        </div>
        <p
          v-if="!events.length"
          class="empty-state"
        >
          Widget lifecycle events will appear here.
        </p>
        <ol
          v-else
          aria-live="polite"
        >
          <li
            v-for="(event, index) in events"
            :key="`${index}-${event}`"
          >
            <span>{{ event }}</span>
            <small>#{{ events.length - index }}</small>
          </li>
        </ol>
      </section>
    </div>
  </main>
</template>

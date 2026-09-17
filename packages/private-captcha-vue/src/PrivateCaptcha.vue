<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  CaptchaWidget as CoreCaptchaWidget,
  type CaptchaWidgetOptions,
} from '@private-captcha/private-captcha-js-core';
import type {
  PrivateCaptchaEventDetail,
  PrivateCaptchaProps,
  PrivateCaptchaWidget,
} from './types';

const props = withDefaults(defineProps<PrivateCaptchaProps>(), {
  debug: undefined,
  eu: undefined,
});
const emit = defineEmits<{
  init: [detail: PrivateCaptchaEventDetail];
  start: [detail: PrivateCaptchaEventDetail];
  finish: [detail: PrivateCaptchaEventDetail];
  error: [detail: PrivateCaptchaEventDetail];
  reset: [detail: PrivateCaptchaEventDetail];
}>();

const captchaElement = ref<HTMLDivElement | null>(null);
const initialStoreVariable = props.storeVariable;
let coreWidget: CoreCaptchaWidget | null = null;

function currentOptions(): CaptchaWidgetOptions {
  const options: CaptchaWidgetOptions = { sitekey: props.siteKey };
  if (props.startMode !== undefined) options.startMode = props.startMode;
  if (props.debug !== undefined) options.debug = props.debug;
  if (props.fieldName !== undefined) options.fieldName = props.fieldName;
  if (props.puzzleEndpoint !== undefined) {
    options.puzzleEndpoint = props.puzzleEndpoint;
  }
  if (props.displayMode !== undefined) options.displayMode = props.displayMode;
  if (props.lang !== undefined) options.lang = props.lang;
  if (props.theme !== undefined) options.theme = props.theme;
  if (props.styles !== undefined) options.styles = props.styles;
  if (initialStoreVariable !== undefined) {
    options.storeVariable = initialStoreVariable;
  }
  if (props.compat !== undefined) options.compat = props.compat;
  return options;
}

function solutionFieldName(options: CaptchaWidgetOptions): string {
  return options.fieldName
    ?? (options.compat === 'recaptcha'
      ? 'g-recaptcha-response'
      : 'private-captcha-solution');
}

function removeSolutionField(name: string): void {
  for (const input of captchaElement.value?.querySelectorAll(
    'input[type="hidden"]',
  ) ?? []) {
    if (input instanceof HTMLInputElement && input.name === name) {
      input.remove();
    }
  }
}

const widget: PrivateCaptchaWidget = {
  execute(): void {
    if (coreWidget) void coreWidget.execute();
  },
  reset(): void {
    coreWidget?.reset(currentOptions());
  },
  solution(): string | null {
    return coreWidget?.solution() ?? null;
  },
  element(): HTMLElement {
    if (!captchaElement.value) {
      throw new Error('Private Captcha is not mounted');
    }
    return captchaElement.value;
  },
};

function detail(): PrivateCaptchaEventDetail {
  return { widget, element: widget.element() };
}

const listeners = {
  'privatecaptcha:init': () => emit('init', detail()),
  'privatecaptcha:start': () => emit('start', detail()),
  'privatecaptcha:finish': () => emit('finish', detail()),
  'privatecaptcha:error': () => emit('error', detail()),
  'privatecaptcha:reset': () => emit('reset', detail()),
};

watch(
  () => [currentOptions(), props.eu] as const,
  ([options], [previousOptions]) => {
    const previousFieldName = solutionFieldName(previousOptions);
    if (previousFieldName !== solutionFieldName(options)) {
      removeSolutionField(previousFieldName);
    }
    coreWidget?.reset(options);
  },
  { flush: 'post' },
);

onMounted(() => {
  const element = captchaElement.value;
  if (!element) return;

  for (const [name, listener] of Object.entries(listeners)) {
    element.addEventListener(name, listener);
  }
  coreWidget = new CoreCaptchaWidget(element, currentOptions());
});

onBeforeUnmount(() => {
  const element = captchaElement.value;
  if (element) {
    for (const [name, listener] of Object.entries(listeners)) {
      element.removeEventListener(name, listener);
    }
  }
  widget.reset();
  coreWidget = null;
});

defineExpose(widget);
</script>

<template>
  <div
    ref="captchaElement"
    class="private-captcha"
    :data-sitekey="siteKey"
    :data-start-mode="startMode"
    :data-debug="debug ? 'true' : undefined"
    :data-solution-field="fieldName"
    :data-puzzle-endpoint="puzzleEndpoint"
    :data-display-mode="displayMode"
    :data-lang="lang"
    :data-theme="theme"
    :data-styles="styles"
    :data-store-variable="initialStoreVariable"
    :data-eu="eu ? 'true' : undefined"
  />
</template>

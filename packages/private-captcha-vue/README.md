# Private Captcha Vue Component

A typed Vue 3 component for Private Captcha's client-side proof-of-work widget.

## Installation

```bash
npm install @private-captcha/private-captcha-vue
```

## Usage

The component must be rendered inside a form.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  PrivateCaptcha,
  type PrivateCaptchaEventDetail,
  type PrivateCaptchaExposed,
} from '@private-captcha/private-captcha-vue';

const captcha = ref<PrivateCaptchaExposed | null>(null);

function handleFinish(detail: PrivateCaptchaEventDetail): void {
  console.log('Captcha solved', detail.widget.solution());
}
</script>

<template>
  <form>
    <PrivateCaptcha
      ref="captcha"
      site-key="your-site-key"
      @finish="handleFinish"
    />
    <button type="button" @click="captcha?.reset()">Reset</button>
  </form>
</template>
```

The hidden solution field is added to the parent form by the widget and must be
verified on your server.

## Props

| Prop | Type | Default |
|---|---|---|
| `siteKey` | `string` | Required |
| `startMode` | `'auto' \| 'click'` | `'auto'` |
| `debug` | `boolean` | `false` |
| `fieldName` | `string` | `'private-captcha-solution'` |
| `puzzleEndpoint` | `string` | Private Captcha endpoint |
| `displayMode` | `'widget' \| 'popup' \| 'hidden'` | `'widget'` |
| `lang` | Supported language code or `'auto'` | `'auto'` |
| `theme` | `'light' \| 'dark'` | `'light'` |
| `styles` | `string` | Widget defaults |
| `storeVariable` | `string` | None |
| `eu` | `boolean` | `false` |
| `compat` | `'recaptcha'` | None |

See the [widget options documentation](https://docs.privatecaptcha.com/docs/reference/widget-options/) for option details.

All props except `storeVariable` are reactive and reset the widget with the current configuration. To change `storeVariable`, remount the component with a new Vue `key`.

## Events

The component emits `init`, `start`, `finish`, `error`, and `reset`. Each event receives a `PrivateCaptchaEventDetail` containing the host element and the public widget facade.

## Public Methods

A component template ref exposes:

- `execute(): void`
- `reset(): void`
- `solution(): string | null`
- `element(): HTMLElement`

Completion is reported through the `finish` event; `execute()` is intentionally
not awaitable.

## SSR and Cleanup

The package can be imported and server-rendered without browser globals. The core widget is created only after client mount.

The upstream core currently has no complete destroy API. This component removes its own listeners and resets the widget before unmount, but the core may retain its form focus listener when only the component is removed. Prefer keeping one widget mounted or unmounting its containing form at the same time.

## Requirements

- Vue 3.3 or later

## License

MIT

# Private Captcha Vue Component

[![NPM Version badge](https://img.shields.io/npm/v/%40private-captcha/private-captcha-vue)](https://www.npmjs.com/package/@private-captcha/private-captcha-vue) ![CI](https://github.com/PrivateCaptcha/private-captcha-vue/actions/workflows/ci.yml/badge.svg)

A Vue 3 component for integrating Private Captcha's client-side proof-of-work captcha into your Vue applications.

## Installation

```bash
npm install @private-captcha/private-captcha-vue
```

## Basic Usage

> NOTE: The captcha component must be rendered **inside a form**.

```vue
<script setup lang="ts">
import {
  PrivateCaptcha,
  type PrivateCaptchaEventDetail,
} from '@private-captcha/private-captcha-vue';

function handleCaptchaFinished(detail: PrivateCaptchaEventDetail): void {
  console.log('Captcha solved!', detail.widget.solution());
  // Submit your form here or enable the submit button.
}
</script>

<template>
  <form>
    <input type="text" name="username" placeholder="Username">
    <input type="password" name="password" placeholder="Password">

    <PrivateCaptcha
      site-key="your-site-key-here"
      theme="dark"
      @finish="handleCaptchaFinished"
    />

    <button type="submit">Login</button>
  </form>
</template>
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `siteKey` | `string` | Your Private Captcha site key |

### Optional Props

Please refer to the [official widget options](https://docs.privatecaptcha.com/docs/reference/widget-options/) documentation.

### Events

All event handlers receive a `detail` object with these properties:

- `detail.widget` - The captcha widget facade with methods:
  - `execute()` - Start solving the captcha
  - `reset()` - Reset the captcha
  - `solution()` - Get the current solution string or `null`
  - `element()` - Get the DOM element hosting the captcha
- `detail.element` - The DOM element hosting the captcha

| Event | Handler type | Description |
|-------|--------------|-------------|
| `@init` | `(detail) => void` | Called when the captcha is initialized |
| `@start` | `(detail) => void` | Called when solving starts |
| `@finish` | `(detail) => void` | Called when solving completes |
| `@error` | `(detail) => void` | Called when an error occurs |
| `@reset` | `(detail) => void` | Called when the captcha is reset |

## Examples

### EU Isolation

```vue
<PrivateCaptcha
  site-key="your-site-key"
  :eu="true"
/>
```

## Requirements

- Vue 3.3+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

For issues with this Vue component, please open an issue on GitHub.

For Private Captcha service questions, visit [privatecaptcha.com](https://privatecaptcha.com).

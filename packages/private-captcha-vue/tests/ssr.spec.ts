// @vitest-environment node

import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';
import PrivateCaptcha from '../src/PrivateCaptcha.vue';

const constructWidget = vi.hoisted(() => vi.fn());

vi.mock('@private-captcha/private-captcha-js-core', () => ({
  CaptchaWidget: class {
    constructor() {
      constructWidget();
    }
  },
}));

describe('PrivateCaptcha SSR', () => {
  it('renders the host without constructing the widget', async () => {
    const app = createSSRApp({
      render: () => h(PrivateCaptcha, { siteKey: 'test-site-key' }),
    });

    const html = await renderToString(app);

    expect(html).toContain('class="private-captcha"');
    expect(html).toContain('data-sitekey="test-site-key"');
    expect(constructWidget).not.toHaveBeenCalled();
  });
});

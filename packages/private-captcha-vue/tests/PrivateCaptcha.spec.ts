import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PrivateCaptcha from '../src/PrivateCaptcha.vue';

type WidgetMock = {
  options: Record<string, unknown>;
  execute: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  solution: ReturnType<typeof vi.fn>;
  element: ReturnType<typeof vi.fn>;
};

const core = vi.hoisted(() => ({
  dispatchOnConstruct: false,
  instances: [] as WidgetMock[],
}));

vi.mock('@private-captcha/private-captcha-js-core', () => ({
  CaptchaWidget: class {
    execute = vi.fn();
    reset = vi.fn();
    solution = vi.fn(() => 'solved');
    element: ReturnType<typeof vi.fn>;

    constructor(element: HTMLElement, options: Record<string, unknown>) {
      this.options = options;
      this.element = vi.fn(() => element);
      core.instances.push(this);
      if (core.dispatchOnConstruct) {
        element.dispatchEvent(new CustomEvent('privatecaptcha:init'));
      }
    }
  },
}));

describe('PrivateCaptcha', () => {
  beforeEach(() => {
    core.dispatchOnConstruct = false;
    core.instances.length = 0;
  });

  it('registers listeners before constructing the core widget', () => {
    core.dispatchOnConstruct = true;

    const wrapper = mount(PrivateCaptcha, {
      props: { siteKey: 'test-site-key' },
    });

    expect(wrapper.emitted('init')).toHaveLength(1);
  });

  it('forwards widget events through the public facade', () => {
    const wrapper = mount(PrivateCaptcha, {
      props: { siteKey: 'test-site-key' },
    });
    const host = wrapper.element;
    const facade = wrapper.vm as unknown as {
      execute(): void;
      reset(): void;
      solution(): string | null;
      element(): HTMLElement;
    };
    const widget = core.instances[0];

    let eventFacade: typeof facade | undefined;
    for (const name of ['init', 'start', 'finish', 'error', 'reset']) {
      host.dispatchEvent(new CustomEvent(`privatecaptcha:${name}`));
      const detail = wrapper.emitted(name)?.[0]?.[0] as
        | { widget: typeof facade; element: HTMLElement }
        | undefined;

      expect(detail?.element).toBe(host);
      eventFacade ??= detail?.widget;
      expect(detail?.widget).toBe(eventFacade);
    }

    facade.execute();
    facade.reset();

    expect(core.instances).toHaveLength(1);
    expect(widget.execute).toHaveBeenCalledOnce();
    expect(widget.reset).toHaveBeenCalledOnce();
    expect(facade.solution()).toBe('solved');
    expect(facade.element()).toBe(host);
  });

  it('removes listeners and resets the core widget before unmount', () => {
    const wrapper = mount(PrivateCaptcha, {
      props: { siteKey: 'test-site-key' },
    });
    const widget = core.instances.at(-1);
    const host = wrapper.element;

    wrapper.unmount();
    host.dispatchEvent(new CustomEvent('privatecaptcha:reset'));

    expect(widget?.reset).toHaveBeenCalledOnce();
    expect(wrapper.emitted('reset')).toBeUndefined();
  });

  it('maps the documented props to core options and data attributes', () => {
    const wrapper = mount(PrivateCaptcha, {
      props: {
        siteKey: 'test-site-key',
        startMode: 'click',
        debug: false,
        fieldName: 'captcha-answer',
        puzzleEndpoint: 'https://captcha.example/puzzle',
        displayMode: 'popup',
        lang: 'de',
        theme: 'dark',
        styles: '--border-radius: 1rem;',
        storeVariable: 'captchaWidget',
        eu: false,
        compat: 'recaptcha',
      },
      attrs: {
        id: 'captcha-host',
        class: 'consumer-class',
        'aria-label': 'Captcha challenge',
      },
    });

    expect(core.instances[0]?.options).toEqual({
      sitekey: 'test-site-key',
      startMode: 'click',
      debug: false,
      fieldName: 'captcha-answer',
      puzzleEndpoint: 'https://captcha.example/puzzle',
      displayMode: 'popup',
      lang: 'de',
      theme: 'dark',
      styles: '--border-radius: 1rem;',
      storeVariable: 'captchaWidget',
      compat: 'recaptcha',
    });
    expect(wrapper.attributes()).toMatchObject({
      'data-sitekey': 'test-site-key',
      'data-start-mode': 'click',
      'data-solution-field': 'captcha-answer',
      'data-puzzle-endpoint': 'https://captcha.example/puzzle',
      'data-display-mode': 'popup',
      'data-lang': 'de',
      'data-theme': 'dark',
      'data-styles': '--border-radius: 1rem;',
      'data-store-variable': 'captchaWidget',
    });
    expect(wrapper.attributes('data-debug')).toBeUndefined();
    expect(wrapper.attributes('data-eu')).toBeUndefined();
    expect(wrapper.attributes('id')).toBe('captcha-host');
    expect(wrapper.attributes('aria-label')).toBe('Captcha challenge');
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['private-captcha', 'consumer-class']),
    );
  });

  it('removes only its stale solution field when fieldName changes', async () => {
    const form = document.createElement('form');
    document.body.append(form);
    const wrapper = mount(PrivateCaptcha, {
      attachTo: form,
      props: {
        siteKey: 'test-site-key',
        fieldName: 'old-answer',
        storeVariable: 'initialWidget',
      },
    });
    const oldSolution = document.createElement('input');
    oldSolution.type = 'hidden';
    oldSolution.name = 'old-answer';
    wrapper.element.append(oldSolution);
    const unrelatedSolution = document.createElement('input');
    unrelatedSolution.type = 'hidden';
    unrelatedSolution.name = 'old-answer';
    form.append(unrelatedSolution);
    const widget = core.instances[0];

    await wrapper.setProps({ fieldName: 'new-answer', theme: 'dark' });

    expect(oldSolution.isConnected).toBe(false);
    expect(unrelatedSolution.isConnected).toBe(true);
    expect(widget.reset).toHaveBeenCalledOnce();
    expect(widget.reset).toHaveBeenCalledWith({
      sitekey: 'test-site-key',
      fieldName: 'new-answer',
      theme: 'dark',
      storeVariable: 'initialWidget',
    });

    await wrapper.setProps({ storeVariable: 'ignoredWidget' });

    expect(widget.reset).toHaveBeenCalledOnce();
    expect(wrapper.attributes('data-store-variable')).toBe('initialWidget');
    wrapper.unmount();
    form.remove();
  });

  it('resets with the complete reactive options and mount-only storeVariable', async () => {
    const wrapper = mount(PrivateCaptcha, {
      props: {
        siteKey: 'initial-site-key',
        storeVariable: 'initialWidget',
      },
    });
    const widget = core.instances[0];

    await wrapper.setProps({
      siteKey: 'updated-site-key',
      startMode: 'click',
      debug: true,
      fieldName: 'captcha-answer',
      puzzleEndpoint: 'https://captcha.example/puzzle',
      displayMode: 'popup',
      lang: 'de',
      theme: 'dark',
      styles: '--border-radius: 1rem;',
      storeVariable: 'ignoredWidget',
      eu: true,
      compat: 'recaptcha',
    });

    expect(widget.reset).toHaveBeenCalledOnce();
    expect(widget.reset).toHaveBeenCalledWith({
      sitekey: 'updated-site-key',
      startMode: 'click',
      debug: true,
      fieldName: 'captcha-answer',
      puzzleEndpoint: 'https://captcha.example/puzzle',
      displayMode: 'popup',
      lang: 'de',
      theme: 'dark',
      styles: '--border-radius: 1rem;',
      storeVariable: 'initialWidget',
      compat: 'recaptcha',
    });
    expect(wrapper.attributes('data-eu')).toBe('true');
    expect(wrapper.attributes('data-store-variable')).toBe('initialWidget');
  });

  it('does not reset for unchanged props', async () => {
    const wrapper = mount(PrivateCaptcha, {
      props: { siteKey: 'test-site-key', theme: 'light' },
    });
    const widget = core.instances[0];

    await wrapper.setProps({ siteKey: 'test-site-key', theme: 'light' });

    expect(widget.reset).not.toHaveBeenCalled();
  });
});

declare module '@private-captcha/private-captcha-js-core' {
  export interface CaptchaWidgetOptions {
    sitekey?: string;
    startMode?: 'auto' | 'click';
    debug?: boolean;
    fieldName?: string;
    puzzleEndpoint?: string;
    displayMode?: 'widget' | 'popup' | 'hidden';
    lang?: string;
    theme?: 'light' | 'dark';
    styles?: string;
    storeVariable?: string;
    compat?: 'recaptcha';
  }

  export class CaptchaWidget {
    constructor(element: HTMLElement, options?: CaptchaWidgetOptions);
    execute(): Promise<never>;
    reset(options?: CaptchaWidgetOptions): void;
    solution(): string | null;
    element(): HTMLElement;
  }
}

export type PrivateCaptchaStartMode = 'auto' | 'click';
export type PrivateCaptchaDisplayMode = 'widget' | 'popup' | 'hidden';
export type PrivateCaptchaTheme = 'light' | 'dark';
export type PrivateCaptchaLanguage =
  | 'auto'
  | 'en'
  | 'de'
  | 'es'
  | 'fr'
  | 'it'
  | 'nl'
  | 'sv'
  | 'no'
  | 'pl'
  | 'fi'
  | 'et'
  | 'uk'
  | 'tr';

export interface PrivateCaptchaProps {
  siteKey: string;
  startMode?: PrivateCaptchaStartMode;
  debug?: boolean;
  fieldName?: string;
  puzzleEndpoint?: string;
  displayMode?: PrivateCaptchaDisplayMode;
  lang?: PrivateCaptchaLanguage;
  theme?: PrivateCaptchaTheme;
  styles?: string;
  storeVariable?: string;
  eu?: boolean;
  compat?: 'recaptcha';
}

export interface PrivateCaptchaWidget {
  execute(): void;
  reset(): void;
  solution(): string | null;
  element(): HTMLElement;
}

export type PrivateCaptchaExposed = PrivateCaptchaWidget;

export interface PrivateCaptchaEventDetail {
  widget: PrivateCaptchaWidget;
  element: HTMLElement;
}

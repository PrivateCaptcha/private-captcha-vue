# Private Captcha Vue Manual Test

The demo is already initialized and defaults to the public Private Captcha test
key. From a fresh checkout:

```bash
cd packages/demo-app
npm install
npm start
```

Open `http://127.0.0.1:5173`. Do not run `npm init`; `package.json` and the root
workspace lockfile are already configured.

To test another site key:

```bash
VITE_PRIVATE_CAPTCHA_SITE_KEY=your-site-key npm start
```

## Development

Run all repository checks from the repository root:

```bash
cd ../..
npm run validate
```

## Checklist

1. Open the page and confirm the widget appears with no browser-console errors.
2. Select **Read solution** before solving and confirm the result is `none`.
3. Select **Execute**, complete the challenge, and confirm `init`, `start`, and
   `finish` appear. Select **Read solution** and confirm a value is shown.
4. Change Theme and Language. Confirm the widget updates and a `reset` event is
   listed without creating a second widget.
5. Test Widget, Popup, and Hidden display modes. In each mode, confirm Execute
   and Reset remain usable.
6. After solving, inspect the `.private-captcha` element and confirm it contains
   one hidden input named `private-captcha-solution`. Change **Solution field
   name** and confirm the old hidden input is removed; solve again and confirm
   the replacement uses the new name.
7. Use Tab and Enter/Space to operate every control and confirm focus remains
   visible.
8. Repeat at a mobile viewport around 390 px wide and confirm the controls,
   widget, action buttons, solution, and event log remain usable.

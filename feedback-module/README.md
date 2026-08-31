# Feedback Module

A reusable page-feedback module with:
- Public feedback and replies
- Element-following pins
- Feedback list for current page
- Feedback ID display
- Delete flow with password confirmation
- Supabase schema fallback for missing columns

## Quick Start

1. Include CSS and JS:

```html
<link rel="stylesheet" href="feedback-module/feedback-module.css" />
<script src="feedback-module/feedback-module.js"></script>
```

2. Initialize once per page:

```html
<script>
  window.TuringFeedbackModule.init({
    apiUrl: 'https://YOUR_PROJECT.supabase.co/rest/v1/page_comments',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    deletePassword: '000000',
    storagePrefix: 'my-project-feedback',
    pagePathResolver: function () {
      var name = location.pathname.split('/').filter(Boolean).pop() || '';
      return /\.html$/i.test(name) ? name : 'index.html';
    }
  });
</script>
```

## Even Simpler: Single-File Bundle

If you want one file only, use `feedback-module.bundle.js`:

```html
<script src="feedback-module/feedback-module.bundle.js"></script>
<script>
  window.TuringFeedbackModule.init({
    apiUrl: 'https://YOUR_PROJECT.supabase.co/rest/v1/page_comments',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    deletePassword: '000000'
  });
</script>
```

## Config

- `apiUrl` (required): Supabase REST endpoint of table, e.g. `.../rest/v1/page_comments`
- `apiKey` (required): Supabase anon key
- `deletePassword` (optional): Password required when deleting feedback
- `storagePrefix` (optional): Prefix for localStorage keys, default `feedback-module`
- `pagePath` (optional): Fixed page path for all comments on this page
- `pagePathResolver` (optional): Function returning page path string
- `pollInterval` (optional): Auto refresh interval in ms, default `20000`
- `canDelete` (optional): `boolean` or `(comment) => boolean` to control delete button visibility

## Project-Level Global Config (Optional)

Your page can define `window.FEEDBACK_CONFIG`, then keep a shared bootstrap script:

```html
<script>
  window.FEEDBACK_CONFIG = {
    apiUrl: 'https://YOUR_PROJECT.supabase.co/rest/v1/page_comments',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    deletePassword: '000000',
    storagePrefix: 'my-feedback'
  };
</script>
```

Then in bootstrap file:

```js
window.TuringFeedbackModule.init(Object.assign({}, defaults, window.FEEDBACK_CONFIG || {}));
```

## Notes

- All visitors can read/write feedback by design.
- Final delete authority still depends on your database RLS and grants.
- For production security, prefer server-side verification instead of exposing delete password in frontend.

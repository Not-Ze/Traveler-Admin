# 🛠️ Copilot Instructions for Traveler-Admin

Welcome to the **Traveler-Admin** codebase. This guide provides AI agents with the essential context, conventions, and patterns to be immediately productive.

## 1. Big Picture Architecture

- **Frameworks & Tooling**: Vue 3 + Vuetify 3 UI components, Pinia for state, Vue Router (auto-generated routes via `unplugin-vue-router` + `vite-plugin-vue-layouts-next`), Vite as dev/build tool.
- **HTTP Layer**: `api/Api.js` exports `ApiAxios` wrapper. All stores call `ApiAxios.index()`, `.store()`, `.show()`, `.update()`, `.updatePatch()` to interact with a Laravel-style REST API at `http://127.0.0.1:8000/api/admin`.
- **Auto-imports**: `unplugin-auto-import` + `unplugin-vue-components` bring in Vue, Pinia, Vue Router composables and Vuetify components without manual imports.
- **Routing & Layouts**: Files in `src/pages/**` map 1:1 to routes. Nest folders to create nested paths. Use `layouts/default.vue` for shared layouts.

## 2. Directory Structure & Key Files

```
src/
├─ pages/       ← auto-generated routes (e.g., `users/[id].vue` for dynamic routes)
├─ layouts/     ← layout wrappers used by `vite-plugin-vue-layouts-next`
├─ components/  ← reusable UI components (auto-imported)
├─ stores/      ← Pinia stores (one file per domain with `defineStore`)
├─ plugins/     ← Vuetify setup (`vuetify.js`)
├─ router/      ← route guard & error handling (`index.js`)
└─ assets/      ← static images & logos
api/Api.js      ← Axios instance & helper methods
vite.config.mjs ← Vite plugins, alias `@` → `src`
package.json    ← scripts: `dev`, `build`, `preview`, `lint`
```

## 3. Developer Workflows

- **Dev Server**: `npm run dev` (Vite on `http://localhost:3000`)
- **Build**: `npm run build` → output in `dist/`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint` (ESLint + Vuetify config)

> ℹ️ Add `NODE_OPTIONS='--no-warnings'` on Node v21+ to suppress Vuetify import warnings.

## 4. Patterns & Conventions

- **API calls**: Always use `ApiAxios.<method>(path, dataOrId, token, filters)` from within Pinia stores. Pass `this.token` from `useAuthStore()`.
- **Authentication**: Guard defined in `router/index.js`; public page = `/login`. `useAuthStore()` holds `user`, `token`, `isAuthenticated`.
- **Stores**: Name files like `userStore.js`, export `useUserStore`. Keep data, filters, error/loading flags in state.
- **Dynamic routes**: Use `[param].vue` under `pages` for dynamic IDs. Access via `useRoute().params.param`.
- **Dialogs & Forms**: Follow existing pattern in `src/pages/countries/components/CountryFormDialog.vue` and `DeleteConfirmationDialog.vue`.

## 5. When Adding New Features

1. **New Page**: Create `src/pages/<entity>/index.vue`, `create.vue`, `edit.vue`. Leverage auto-generated routes.
2. **Store**: Add `src/stores/<entity>Store.js`, define actions to call `ApiAxios` methods.
3. **API Endpoint**: Extend `api/Api.js` if a special `PUT/PATCH` or file upload is needed; otherwise use generic methods.
4. **Layout**: If page needs custom layout, add `<layout name>` under `src/layouts` and reference via frontmatter comment `--- layout: custom ---`.

## 6. Integration Points

- **Vue Router**: via `createRouter` in `router/index.js`, auto-imported routes from `src/pages`.
- **Pinia**: registered in `main.js` using `createPinia()`.
- **Vuetify**: theme customizations in `plugins/vuetify.js` and SCSS variables in `src/styles/settings.scss`.

_For any questions or missing context, please ask for clarification._

# Vue Simple ACL

A simple unopinionated Vue plugin for managing user roles and permissions, access-control list (ACL) and role-based access control (RBAC).

<div align="center">

  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img src="https://img.shields.io/npm/v/vue-simple-acl.svg" alt="Version">
  </a>
  <a href="https://vuejs.org/" target="_blank"><img src="https://badgen.net/badge/Vue/2.x/cyan" alt="Vue 2"></a>
  <a href="https://v3.vuejs.org/" target="_blank"><img src="https://badgen.net/badge/Vue/3.x/cyan" alt="Vue 3"></a>
  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="NPM Total Downloads" src="https://img.shields.io/npm/dt/vue-simple-acl?color=%2353ca2f">
  </a>
  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="NPM Monthly Downloads" src="https://img.shields.io/npm/dm/vue-simple-acl?color=%2353ca2f">
  </a>
  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="NPM bundle size (scoped version)" src="https://img.shields.io/bundlephobia/minzip/vue-simple-acl?color=53ca2f">
  </a>
  <a href="LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/vue-gates.svg" alt="License"></a>

</div>

## Table of Contents
- [Vue Simple ACL](#vue-simple-acl)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
      - [NPM](#npm)
      - [Yarn](#yarn)
      - [CDN](#cdn)
  - [Usage](#usage)
    - [Usage with Vue 3](#usage-with-vue-3)
    - [Usage with Vue 2](#usage-with-vue-2)
    - [ACL Rules File](#acl-rules-file)
    - [Usage in component](#usage-in-component)
      - [`hide` modifier](#hide-modifier)
      - [`disable` modifier](#disable-modifier)
      - [`readonly` modifier](#readonly-modifier)
      - [`not` modifier](#not-modifier)
      - [`any` modifier](#any-modifier)
    - [Using helper function in component](#using-helper-function-in-component)
    - [Using helper function in `setup` Vue's Composition API](#using-helper-function-in-setup-vues-composition-api)
    - [Middleware for Vue Router](#middleware-for-vue-router)
      - [`onDeniedRoute` meta property](#ondeniedroute-meta-property)
      - [$from as value `onDeniedRoute`](#from-as-value-ondeniedroute)
    - [Vue Router `meta` Properties](#vue-router-meta-properties)
  - [Semantic Alias directives and methods](#semantic-alias-directives-and-methods)
  - [Vue Simple ACL Options](#vue-simple-acl-options)
  - [TODO](#todo)
  - [🤝 Contributing](#-contributing)
  - [⭐️ Support](#️-support)
  - [📄 License](#-license)


<br>

<a name="features"></a>

## Features
- Vue 2 and Vue 3 support
- Simple but robust and power ACL plugin
- Manage roles and permissions with ease.
- Lightweight (<3 kB zipped)
- Component `v-can` directive
- Global `$can` helper function
- Sematic alias methods and directives of different verb for directive and helper function. E.g `v-role`, `v-permission`, `$acl.permission()`, `$acl.anyRole()`, etc.
- Middleware support for [Vue Router](https://next.router.vuejs.org/) through `meta` property.
- Support user data from plain object, pinia/vuex store and asynchronous function.
- Reactive changes of abilities and permissions
- Define custom ACL rules
- Fully Typecript: The source code is written entirely in TypeScript.
- Fully configurable

<a name="installation"></a>

## Installation
#### NPM
```
npm install vue-simple-acl
```
#### Yarn
```
yarn add vue-simple-acl
```
#### CDN
[UNPKG](https://unpkg.com/vue-simple-acl)
[JSDelivr](https://cdn.jsdelivr.net/npm/vue-simple-acl@latest/dist/vue-simple-acl.js)


<a name="usage"></a>

## Usage

<a name="usage-vue3"></a>

### Usage with Vue 3
```javascript
// src/main.js  OR  src/main.ts

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import store from './store';
import acl from './acl'; // import the instance of the defined ACL

const app = createApp(App);
app.use(router);
app.use(store);
app.use(acl); // install vue-simple-acl
app.mount("#app");
```

<a name="usage-vue2"></a>

### Usage with Vue 2
In Vue 2, when using User data from reactive Store/Pinia/Vuex wrapped with `computed()` function, which is available in Vue 3 as module by default but not in Vue 2, make sure to install [@vue/composition-api](https://github.com/vuejs/composition-api#npm) first and change the imported module to: `import { computed } from '@vue/composition-api'`
```javascript
// src/main.js  OR  src/main.ts

import Vue from 'vue'
import App from './App.vue'
import router from './router';
import store from './store';
import acl from './acl'; // import the instance of the defined ACL

Vue.config.productionTip = false;

Vue.use(acl); // install vue-simple-acl

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
```

<a name="acl-file"></a>

### ACL Rules File
For readability, it is recommend to defined your ACL rules in a separate file.
```javascript
// src/acl/index.js  OR  src/acl/index.ts

// Import router if you are using the middleware on Vue Router
import router from "../router"; 
// Import store if you are using reactive Store/Pinia/Vuex as User data source
import store from "../store";

// ----- VUE 3 Imports -----
import { computed } from 'vue'; // For VUE 3
import { createAcl, defineAclRules } from 'vue-simple-acl';

// ----- VUE 2 Imports -----
import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api'; // Ensure this is installed
Vue.use(VueCompositionAPI); // VueCompositionAPI must be used as plugin before any function, otherwise see your console if warning/errpr
import { computed } from '@vue/composition-api'; // import computed function
import { createAcl, defineAclRules } from 'vue-simple-acl';

// ---------------
// The Vue Simple ACL option 'user' can be a user OBJECT, FUNCTION returning a user object
// or an Asynchronous function returning a PROMISE of user object, suitable for performing fetch from API.

// USER EXAMPLE 1: User {OBJECT}
const user = {
  id: 1,
  name: 'Victory Osayi',
  is_editor: true,
  is_admin: false,
  // you can have role based permission list or access control list possibly from database
  permissions: ['admin', 'owner', 'moderator', 'create-post', 'edit-post', 'delete-post']
}

// USER EXAMPLE 2: User object from a {FUNCTION} or computed property like from Pinia/Vuex Store
// Suitable if you already has an existing logics authenticating and saving user data to Pinia/Vuex Store
const user2 = computed(() => store.state.auth.user);

// USER EXAMPLE 3; User object from an Asynchronous {FUNCTION} / {PROMISE}:
// Using Async/Promise requires instance of vue-router, the function will be auto hooked to beforeEach() peroperty of vue-router
const user3 = () => {
  const authUserId = 1; // ID of authenticated user
  return axios.get(`api/users/${authUserId}`)
    .then((response) => response.data);
}

const rules = () => defineAclRules((setRule) => {
  // setRule('unique-ability', callbackFunction(user, arg1, arg2, ...) { });
  // setRule(['unique-ability-1', 'unique-ability-2'], callbackFunction(user, arg1, arg2, ...) { });
  
  // Define a simple rule for ability with no argument
  setRule('create-post', (user) => user.is_admin || user.is_editor);
  setRule('is-admin', (user) => user.is_admin);
  setRule('is-editor', (user) => user.is_editor);
  // Define a simple rule for ability with an argument
  setRule('edit-post', (user, post) => user.id === post.user_id);
  setRule('delete-post', (user, post) => {
    return user.id === post.user_id || user.is_admin;
  });
  // Define rule for array of multiple abilities that share same arguments and callback function
  setRule(['publish-post', 'unpublish-post'], (user, post) => user.id === post.user_id);  
  // Define rule for ability with multiple arguments
  setRule('hide-comment', (user, post, comment) => {
    return user.is_admin || user.id === post.user_id || (user.id === comment.user_id && post.id === comment.post_id);
  });
  setRule('moderator', (user) => user.permissions && user.permissions.includes('moderator'));
});

const simpleAcl = createAcl({
  user, // short for user: user
  rules, // short for rules: rules
  router, // OPTIONAL, short for router: router 
  // other optional vue-simple-acl options here... See Vue Simple ACL Options below
});

export default simpleAcl;
```


<a name="usage-in-component"></a>

### Usage in component

The `v-can` directive can be used in different ways and you can apply one or more modifiers that alters the behaviour of the directive.

```html
<button v-can:create-post>Create Post</button>
<button v-can:edit-post="{ id: 100, user_id: 1, title: 'First Post' }">Edit</button>
<button v-can:edit-post="postData">Edit</button>
```
Alternative you can use the sematic alias;
```html
<button v-permission:create-post>Create Post</button>
<button v-role:admin>Create Post</button>
<button v-role-or-permission="['admin', 'create-post']">Edit</button>
```

#### `hide` modifier
This is the default behaviour of the `v-can` directive, it remove the component or element from the DOM more like `v-if`.
You're not required to apply it unless you want to explicitly state the behavior.
```html
<button v-can:edit-post.hide="postData">Edit</button>
```

#### `disable` modifier
The `disable` modifier applies the disabled attribute to the tag, e.g. to disable a button or input that you are not allowed to use or edit respectively.
```html
<button v-can:edit-post.disable="postData">Edit</button>
<input v-can:edit-post.disable="post" v-model="postTitle" type="text">
```

#### `readonly` modifier
The `readonly` modifier applies the readonly attribute to the tag, e.g. to make an input read only if you don't have permission to edit.
```html
<input v-can:edit-post.readonly="post" v-model="postTitle" type="text">
```

#### `not` modifier
The `not` modifier reverses the ACL query. In this example only if you cannot delete the post the div element is shown.
```html
<div v-can:delete-post.not="postData">You can not delete post created by you, ask admin for help.</div>
```

#### `any` modifier
By default `v-can` directive with value that contains array of multiple abilities and ability arguments will be authorized if all specified abilities passes.
The `any` modifier authorized if atleast one or any of specified abilities and ability arguments passes.
```html
<!-- Authorized if both abilities passes -->
<button v-can="['create-post', ['edit-post', post]]">Create Post</button>
<!-- Authorized if any of the abilities passes -->
<button v-can.any="[['edit-post', post], ['delete-post', post]]">Manage Post</button>
```

<a name="using-helper"></a>

### Using helper function in component

You can also use the helper function $can directly in component and javascript:
```html
<form v-if="$can('edit-post', post)">
    <input type="text" :value="post.title">
    ...
</form>
```
or in Option API
```javascript
if (this.$can('edit-post', post)) {
  axios.put(`/api/posts/${post.id}`, postData)
}
```

<a name="composition-api"></a>

### Using helper function in `setup` Vue's [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html)

The introduction of `setup` and Vue's [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html), open up new possibilities but to be able to get the full potential out of Vue Simple ACL, we will need to use composable functions to replace access to this.
```javascript
import { useAcl } from 'vue-simple-acl';

export default {
  setup() {
    const acl = useAcl();

    if (acl.can('edit-post', post)) {
      axios.put(`/api/posts/${post.id}`, postData)
    }

    if (acl.can('hide-comment', [post, comment])) {
      // Execute this block if user can hide comment of a post
    }

    if (acl.can.not('edit-post', post)) {
      // Execute this block if user can not edit post
    }

    if (acl.can.any(['is-admin', 'is-editor'])) {
      // Execute this block if user is admin OR is editor
    }

    if (acl.can.any([ 'is-admin', ['delete-post', post] ])) {
      // Execute this block if user is admin OR can delete post
    }

    // Get data of the defined ACL User being validated
    const user = acl.user;
    const user = acl.getUser();
  }
}
```

<a name="middleware-for-vue-router"></a>

### Middleware for [Vue Router](https://next.router.vuejs.org/)

To integrate Vue Router, hook up the instance of `vue-router`'s `createRouter({..})` during setup of the Vue Simple ACL.

```javascript
const simpleAcl = createAcl({
  user, // short for user: user
  rules, // short for rules: rules
  router, // short for router: router
  onDeniedRoute: '/unauthorized' // OR { path: '/unauthorized' } OR { name: 'unauthorized', replace: true} or '$from'
});
app.use(simpleAcl);
```

You configure routes by adding `can` meta property to the route. E.g. if a router requires create post permission:
```javascript
{
  path: 'posts/create',
  name: 'createPost',
  component: CreatePost,
  meta: {
    can: 'create-post',
    onDeniedRoute: '/unauthorized' // value of onDeniedRoute option will be used if not set
  }
}
```
If you have a rule that requires multiple abilities, you can do the following:
```javascript
{
  path: 'posts/create',
  name: 'createPost',
  component: CreatePost,
  meta: {
    can: ['is-admin', 'create-post'],
    onDeniedRoute: { name: 'unauthorizedPage', replace: true }
  }
}
```
or using `not` modifier
```javascript
{
  path: 'posts/create',
  name: 'createPost',
  component: CreatePost,
  meta: {
    notCan: 'moderator',
    onDeniedRoute: { name: 'unauthorizedPage', replace: true }
  }
}
```
or using `any` modifier
```javascript
{
  path: 'posts/create',
  name: 'createPost',
  component: CreatePost,
  meta: {
    anyCan: ['is-admin', 'create-post'],
    onDeniedRoute: { name: 'unauthorizedPage', replace: true }
  }
}
```
You can also have an async evaluation by providing a callback that returns a promise the following:
```javascript
{
  path: 'posts/:postId',
  component: PostEditor,
  meta: {
    can: (to, from, can) => {        
      return axios.get(`/api/posts/${to.params.id}`)
        .then((response) => can('edit-post', response.data));
    },
    onDeniedRoute: '/unauthorized'
  }
}
```
or using `any` modifier
```javascript
{
  path: 'posts/:postId/publish',
  component: ManagePost,
  meta: {
    anyCan: (to, from, anyCan) => {        
      return axios.get(`/api/posts/${to.params.id}/publish`)
        .then((response) => anyCan(['is-admin', ['edit-post', response.data]]));
    },
    onDeniedRoute: '/unauthorized'
  }
}
```
or get the data of the defined ACL user in the evaluations by passing `user` as the optional **fourth** argument to the defined ACL meta function
```javascript
{
  path: 'posts/:postId/publish',
  component: ManagePost,
  meta: {
    anyCan: (to, from, anyCan, user) => {        
      return axios.get(`/api/users/${user.id}/posts/${to.params.id}/publish`)
        .then((response) => anyCan(['is-admin', ['edit-post', response.data]]));
    },
    onDeniedRoute: '/unauthorized'
  }
}
```

<a name="vue-router-ondeniedroute"></a>

#### `onDeniedRoute` meta property

By default if you omit the 'onDeniedRoute' property from the a routes meta a denied check will redirect to a value of Vue Simple Acl's `createAcl` option `onDeniedRoute` which is `/` by default. You can change this behaviour by setting the `createAcl` option `onDeniedRoute`. This is useful if you use the package in an authentication or authorization flow by redirecting to unauthorized page if access is denied.

You can also use an object for more options ([see guards section in docs](https://next.router.vuejs.org/guide/advanced/navigation-guards.html)):
```javascript
onDeniedRoute: { path: '/login': replace: true }
```
This will use replace rather than push when redirecting to the login page.
#### $from as value `onDeniedRoute`
```javascript
onDeniedRoute: '$from'
```
You can set the onDeniedRoute to the special value `'$from'` which will return the user to wherever they came from

<a name="vue-router-meta"></a>

### Vue Router `meta` Properties

| Property Name | Type | Default | Description |
| --- | --- | --- | --- |
| **can** or **allCan**| `string` OR `array` of abilities OR `function` of asynchronous evaluation: <span style="white-space:nowrap;">`(to, from, can, user?) => {}`</span> | None | Equivalent of `$can()` and `v-can=""` |
| **notCan** or **canNot** | `string` OR `array` of abilities OR `function` of asynchronous evaluation: <span style="white-space:nowrap;">`(to, from, notCan, user?)`</span> | None | Equivalent of `$can.not()` and `v-can.not=""` |
| **anyCan** or **canAny**| `string` OR `array` of abilities OR `function` of asynchronous evaluation: <span style="white-space:nowrap;">`(to, from, anyCan, user?)`</span> | None | Equivalent of `$can.any()` and `v-can.any=""` |
| **onDeniedRoute** | `string` OR `object` of `route()` option | Value of the default option `onDeniedRoute`  | A route to redirect to when `can|notCan|anyCan` evaluation is denied. e.g string path `'/unauthorized'` OR router option `{ path: '/unauthorized' }` OR `{ name: 'unauthorizedPage', replace: true }` OR special value **`'$from'`** which returns back to the request URI |


<a name="semantic-alias"></a>

## Semantic Alias directives and methods
Vue Simple ACL also provides some directives and methods in different verb as alias for default directive and helper function. You can use these aliases in place of `v-can` directive, `$can` helper function and vue router `can:` meta property for better semantic. See below table.

| Alias Name | Usage |
| --- | --- |
| Permission | As Directives:<br>`v-permission:create-post`<br>`v-permission="'create-post'"`<br> `v-permission.not="'create-post'"`<br> `v-permission.any="['create-post', ['edit-post', post]]"` <br><br> In Component:<br> `$acl.permission('create-post')`<br> `$acl.notPermission('create-post')`<br> `$acl.anyPermission(['create-post', ['edit-post', post]])` <br><br> In Option API:<br> `this.$acl.permission('create-post')`<br> `this.$acl.notPermission('create-post')`<br> `this.$acl.anyPermission(['create-post', ['edit-post', post]])` <br><br> In Composition API/`setup()`:<br> `const acl = useAcl();`<br> `acl.permission('create-post')`<br> `acl.notPermission('create-post')`<br> `acl.anyPermission(['create-post', ['edit-post', post]])` <br><br> In Vue Router `meta` Property:<br> `permission: 'create-post'`<br> `notPermission: ['create-post', 'create-category']` <br><br> `anyPermission: (to, from, anyPermission) => {`<br>&nbsp;&nbsp;`return axios.get(`\``/api/posts/${to.params.id}`\``)`<br>&nbsp;&nbsp;`.then((response) => anyPermission(['create-post', ['edit-post', response.data]]));`<br>`}` |
| Role | As Directives:<br>`v-role:admin`<br>`v-role="'admin'"`<br> `v-role.not="'editor'"`<br> `v-role.any="['admin', 'editor']"` <br><br> In Component:<br> `$acl.role('admin')`<br> `$acl.notRole('editor')`<br> `$acl.anyRole(['admin', 'editor'])` <br><br> In Option API:<br> `this.$acl.role('admin')`<br> `this.$acl.notRole('editor')`<br> `this.$acl.anyRole(['admin', 'editor'])` <br><br> In Composition API/`setup()`:<br> `const acl = useAcl();`<br> `acl.role('admin')`<br> `acl.notRole('editor')`<br> `acl.anyRole(['admin', 'editor'])` <br><br> In Vue Router `meta` Property:<br> `role: 'admin'`<br> `notRole: 'editor'` <br> `anyRole: ['admin', 'editor']` |
| Role Or Permission | As Directives:<br>`v-role-or-permission="['admin', 'create-post']"`<br> `v-role-or-permission.not="['editor', 'create-post']"`<br> `v-role-or-permission.any="['admin', 'create-post', ['edit-post', post]]"` <br><br> In Component:<br> `$acl.roleOrPermission(['admin', 'create-post'])`<br> `$acl.notRoleOrPermission(['editor', 'create-post'])`<br> `$acl.anyRoleOrPermission(['admin', 'create-post', ['edit-post', post]])` <br><br> In Option API:<br> `this.$acl.roleOrPermission(['admin', 'create-post'])`<br> `this.$acl.notRoleOrPermission(['editor', 'create-post'])`<br> `this.$acl.anyRoleOrPermission(['admin', 'create-post', ['edit-post', post]])` <br><br> In Composition API/`setup()`:<br> `const acl = useAcl();`<br> `acl.roleOrPermission(['admin', 'create-post'])`<br> `acl.notRoleOrPermission(['editor', 'create-post'])`<br> `acl.anyRoleOrPermission(['admin', 'create-post', ['edit-post', post]])` <br><br> In Vue Router `meta` Property:<br> `roleOrPermission: ['admin', 'create-post']`<br> `notRoleOrPermission: ['editor', 'create-post', 'create-category']` <br><br> `anyRoleOrPermission: (to, from, anyRoleOrPermission) => {`<br>&nbsp;&nbsp;`return axios.get(`\``/api/posts/${to.params.id}`\``)`<br>&nbsp;&nbsp;`.then((response) => anyRoleOrPermission(['admin', 'create-post', ['edit-post', response.data]]));`<br>`}` |
| User | Get the data of the defined ACL user. <br><br> In Component:<br> `$acl.user; // returns user object`<br>`$acl.getUser(); // returns user object` <br><br> In Option API:<br> `this.$acl.user; // returns user object`<br>`this.$acl.getUser(); // returns user object` <br><br> In Composition API/`setup()`:<br> `const acl = useAcl();`<br> `acl.user; // returns user object`<br>`acl.getUser(); // returns user object` <br><br> In Vue Router `meta` Property:<br> _Pass `user` as the fourth argument to the defined ACL meta function_ <br><br> `roleOrPermission: (to, from, roleOrPermission, user) => {`<br>&nbsp;&nbsp;`return axios.get(`\``/api/users/${user.id}/posts/${to.params.id}`\``)`<br>&nbsp;&nbsp;`.then((response) => roleOrPermission(['admin', ['edit-post', response.data]]));`<br>`}` |


<a name="options"></a>

## Vue Simple ACL Options 
 can be a user OBJECT, FUNCTION returning a user object
// or an Asynchronous function returning a PROMISE of user object, suitable for performing fetch from API.

| Option Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **user** | `object` or a `function|async function/Promise` returning user object. <br> *Using Async/Promise requires instance of `vue-router`, the function will be auto hooked to `beforeEach()` peroperty of vue-router.* | Yes | None | Authenticated user's data e.g object or function or async function/promise returning `{ id: 1, name: 'Victory Osayi', is_admin: true, ... }` |
| **rules** | `function` | Yes | None | function returning instance of `defineAclRules()` e.g `() => defineAclRules((setRule) => {...}` |
| **directiveName** | `object` or a `function` returning user object | No | `'can'` |  You can set a custom directive name if the default name conflicts with other installed plugins. e.g `'custom-can'` then in component like `v-custom-can=""` |
| **helperName** | `object` or a `function` returning user object | No | `'$can'` | You can set a custom helper name if the default name conflicts with other installed plugins. e.g `'$customCan'`, then use in component like `'$customCan()'` or `'$customCan.not()'` |
| **enableSematicAlias** | `boolean` | No | `true` | You can enable or disable the sematic alias directives and methods e.g `v-role`, `v-permission`, `$acl.*`, etc. [See Semantic Alias](#sematic-alias)
| **router** | `vue-router` | No | None | Inte |
| **onDeniedRoute** | `string` or `object` | No | `/` | A route to redirect to when `can` evaluation is denied. e.g string path `'/unauthorized'` OR router option `{ path: '/unauthorized' }` OR `{ name: 'unauthorizedPage', replace: true }` OR special value `'$from'` which returns back to the request URI |


<a name="todo"></a>

## TODO

1. Chore: Write basic tests
2. A documentation page with vitepress

<a name="contributing"></a>

## 🤝 Contributing

1. Fork this repository.
2. Create new branch with feature name.
3. Go to example folder and run `npm install` and `npm run serve`.
4. The plugin sources files is located in `/src/*`.
5. Commit and set commit message with feature name.
6. Push your code to your fork repository.
7. Create pull request. 🙂


<a name="support"></a>

## ⭐️ Support

If you like this project, You can support me with starring ⭐ this repository, [buy me a coffee](https://www.patreon.com/victoryosayi) or [become a patron](https://www.patreon.com/victoryosayi).


<a name="license"></a>

## 📄 License

[MIT](LICENSE)

Developed by [Victory Osayi](https://github.com/victorybiz) with ❤️ and ☕️ from Benin City, Edo, Nigeria.

# Vue Simple ACL for Vue 3

A simple package to manage permissions for Access-Control List (ACL) / Role Based Access Control (RBAC) in a Vue app.

<div align="center">

  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="npm" src="https://img.shields.io/npm/dm/vue-simple-acl?color=%2353ca2f">
  </a>
<!-- 
  <a href="https://codecov.io/gh/victorybiz/vue-simple-acl" target="_blank">
    <img src="https://img.shields.io/victorybiz/c/github/victorybiz/vue-simple-acl"/>
  </a> -->

  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="npm bundle size (scoped version)" src="https://img.shields.io/bundlephobia/minzip/vue-simple-acl?color=53ca2f">
  </a>

  <a href="https://www.npmjs.com/package/vue-simple-acl" target="_blank">
    <img alt="npm" src="https://img.shields.io/npm/v/vue-simple-acl">
  </a>

</div>
<br>
<br>

## Features
- Vue 3 support
- Simple but robust and power ACL plugin
- Lightweight (<12 kB gzipped)
- Component `v-can` directive
- Global `$can` helper function
- Support for [Vue Router](https://next.router.vuejs.org/) through `meta` property.
- Reactive changes of abilities and permissions
- Define custom ACL rules

## Getting started

```
npm install vue-simple-acl
```

## Usage

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { createAcl, defineAclRules } from 'vue-simple-acl';

const user = {
  id: 1,
  name: 'Victory Osayi',
  is_editor: true,
  is_admin: false,
  // you can have role based permission list or access control list possibly from database
  permissions: ['admin', 'owner', 'moderator', 'create-post', 'edit-post', 'delete-post']
}
// Example of user retrieved from backend asynchronously, you can provide a function instead
// to perform asynchronous fetch from api or return data from store/Vuex state
// const user = () => store.auth.user;

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
  // other optional vue-simple-acl options here ...
});

const app = createApp(App);
app.use(simpleAcl); // install vue-simple-acl
app.mount("#app");
```

## Usage in component

The `v-can` directive can be used in different ways and you can apply one or more modifiers that alters the behaviour of the directive.

```html
<button v-can:create-post>Create Post</button>
<button v-can:edit-post="{ id: 100, user_id: 1, title: 'First Post' }">Edit</button>
<button v-can:edit-post="postData">Edit</button>
```

### `hide` modifier
This is the default behaviour of the `v-can` directive, it remove the component or element from the DOM more like `v-if`.
You're not required to apply it unless you want to explicitly state the behavior.
```html
<button v-can:edit-post.hide="postData">Edit</button>
```

### `disable` modifier
The `disable` modifier applies the disabled attribute to the tag, e.g. to disable a button or input that you are not allowed to use or edit respectively.
```html
<button v-can:edit-post.disable="postData">Edit</button>
<input v-can:edit-post.disable="post" v-model="postTitle" type="text">
```

### `readonly` modifier
The `readonly` modifier applies the readonly attribute to the tag, e.g. to make an input read only if you don't have permission to edit.
```html
<input v-can:edit-post.readonly="post" v-model="postTitle" type="text">
```

### `not` modifier
The `not` modifier reverses the ACL query. In this example only if you cannot delete the post the div element is shown.
```html
<div v-can:delete-post.not="postData">You can not delete post created by you, ask admin for help.</div>
```

### `any` modifier
By default `v-can` directive with value that contains array of multiple abilities and ability arguments will be authorized if all specified abilities passes.
The `any` modifier authorized if atleast one or any of specified abilities and ability arguments passes.
```html
<!-- Authorized if both abilities passes -->
<button v-can="['create-post', ['edit-post', post]]">Create Post</button>
<!-- Authorized if any of the abilities passes -->
<button v-can.any="[['edit-post', post], ['delete-post', post]]">Manage Post</button>
```

## Using helper function in component

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

## Using helper function in `setup` Vue's [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html)

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

    // Get data of the ACL User being validated
    const user = acl.user;
  }
}
```

## [Vue Router](https://next.router.vuejs.org/) Integration

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
    canNot: 'moderator',
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
    canAny: ['is-admin', 'create-post'],
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
    canAny: (to, from, canAny) => {        
      return axios.get(`/api/posts/${to.params.id}/publish`)
        .then((response) => canAny(['is-admin', ['edit-post', response.data]]));
    },
    onDeniedRoute: '/unauthorized'
  }
}
```

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
### Vue Router `meta` Properties

| Property Name | Type | Default | Description |
| --- | --- | --- | --- |
| **can** | `string` OR `array` of abilities or `function (to, from, can)` of async evaluation | None | Equivalent of `$can()` and `v-can=""` |
| **canNot** | `string` OR `array` of abilities or `function (to, from, canNot)` of async evaluation | None | Equivalent of $can.not() and v-can.not="" |
| **canAny** | `string` OR `array` of abilities or `function (to, from, canAny)` of async evaluation | None | Equivalent of `$can.any()` and `v-can.any=""` |
| **onDeniedRoute** | `string` OR `object` of `route()` option | Value of the default option `onDeniedRoute`  | A route to redirect to when `can|canNot|canAny` evaluation is denied. e.g string path `'/unauthorized'` OR router option `{ path: '/unauthorized' }` OR `{ name: 'unauthorizedPage', replace: true }` OR special value **`'$from'`** which returns back to the request URI |


## Vue Simple ACL Options 

| Option Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| **user** | `object` or a `function` returning user object | Yes | None | Authenticated user's data e.g `{ id: 1, name: 'Victory Osayi', is_admin: true, ... }` |
| **rules** | `function` | Yes | None | function returning instance of `defineAclRules()` e.g `() => defineAclRules((setRule) => {...}` |
| **directiveName** | `object` or a `function` returning user object | No | `'can'` |  You can set a custom directive name if the default name conflicts with other installed plugins. e.g `'custom-can'` then in component like `v-custom-can=""` |
| **helperName** | `object` or a `function` returning user object | No | `'$can'` | You can set a custom helper name if the default name conflicts with other installed plugins. e.g `'$customCan'`, then use in component like `'$customCan()'` or `'$customCan.not()'` |
| **router** | `vue-router` | No | None | Inte |
| **onDeniedRoute** | `string` or `object` | No | `/` | A route to redirect to when `can` evaluation is denied. e.g string path `'/unauthorized'` OR router option `{ path: '/unauthorized' }` OR `{ name: 'unauthorizedPage', replace: true }` OR special value `'$from'` which returns back to the request URI |


## TODO

1. Chore: Write basic tests
1. A documentation page with vitepress

## 🤝 Contributing

1. Fork this repository.
2. Create new branch with feature name.
3. Go to example folder and run `npm install` and `npm run serve`.
4. The plugin sources files is located in `/src/*`.
5. Commit and set commit message with feature name.
6. Push your code to your fork repository.
7. Create pull request. 🙂

## ⭐️ Support

If you like this project, You can support me with starring ⭐ this repository, [buy me a coffee](https://www.patreon.com/victoryosayi) or [become a patron](https://www.patreon.com/victoryosayi).

## 📄 License

[MIT](LICENSE)

Developed by [Victory Osayi](https://github.com/victorybiz) with ❤️ and ☕️ from Benin City, Edo, Nigeria.

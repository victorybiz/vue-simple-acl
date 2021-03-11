// ======= DEMO =======
import { createApp } from 'vue';
import App from './App.vue';
import { createAcl, defineAclRules } from './VueSimpleAcl';

// Router setup
import { createRouter, createWebHistory } from 'vue-router';
const Home = () => import('./Home.vue');
const About = () => import('./About.vue');
const Unauthorized = () => import('./Unauthorized.vue');
const routes = [
  { path: '/', component: Home },
  { 
    path:'/about',
    component: About,
    meta: {
      can: 'create-post',
      onDeniedRoute: '/unauthorized'
    }
  },
  { 
    path:'/post/:id',
    component: About,
    meta: {
      can: (to, from, can) => {        
        return can('edit-post', { id: 100, user_id: 2 });
        // return axios.get(`/api/posts/${to.params.id}`)
        //   .then((response) => can('edit-post', response.data));
      },
      onDeniedRoute: '/unauthorized'
    }
  },
  { path: '/unauthorized', component: Unauthorized },
]
const router = createRouter({
  history: createWebHistory(),
  routes
})
//

// Vue Simple ACL
const user = {
  id: 1,
  name: 'Victory Osayi',
  is_editor: true,
  is_admin: false,
  // you can have role based permission list or access control list possibly from database
  permissions: ['admin', 'owner', 'moderator', 'create-post', 'edit-post', 'delete-post']
}

const rules = () => defineAclRules((setRule) => {
  setRule('create-post', (user) => user.is_admin || user.is_editor);
  setRule('is-admin', (user) => user.is_admin);
  setRule('is-editor', (user) => user.is_editor);
  setRule('edit-post', (user, post) => user.id === post.user_id);
  setRule(['publish-post', 'unpublish-post'], (user, post) => user.id === post.user_id);
  setRule('delete-post', (user, post) => {
    return user.id === post.user_id || user.is_admin;
  });
  setRule('hide-comment', (user, post, comment) => {
    return user.is_admin || user.id === post.user_id || (user.id === comment.user_id && post.id === comment.post_id);
  });
  setRule('moderator', (user) => user.permissions && user.permissions.includes('moderator'));
});

const simpleAcl = createAcl({
  user, // short for user: user
  rules, // short for rules: rules
  router,
  // other optional vue-simple-acl options here ...
});

const app = createApp(App);
app.use(simpleAcl); // install vue-simple-acl
app.use(router);
app.mount("#app");

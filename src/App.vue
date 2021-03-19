<template>
  <h1>Vue Simple ACL (DEMO)</h1>
  
  <div v-permission:create-post>
    #1. USER-1 can create POST
  </div>
  <br>
  <div v-can:edit-post="post">
    #2. USER-1 can edit POST-1
  </div>
  <br>
  <div v-can:edit-post="post2">
    #3. USER-1 can edit POST-2
  </div>
  <div v-can:edit-post.not="post2">
    #4. USER-1 cannot edit POST-2
  </div>
  <br>
  <div v-can.any="['create-post', ['edit-post', post]]">
    #5. USER-1 can create POST or edit POST-1
  </div>
  <br>
  <button v-can:hide-comment="[post, comment]">
    #6. Post Comment Owner or Post Owner or Admin can hide a comment!
  </button>
  <br>
  <input v-can:edit-post.disabled="post2" v-model="postTitle" type="text">
  <br>...
  {{ $acl }}
  <div v-if="$acl.role('edit-post', post)">
    #1. HELPER: USER-1 can create POST
  </div>

  <br>
  <br>
  ====== ROUTER VIEW ======
  <router-view></router-view>

</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useAcl } from './VueSimpleAcl';

export default defineComponent({
  name: 'App',

  setup: () => {
    const post = {
      id: 100,
      user_id: 1,
      title: "First Post"
    }
    const post2 = {
      id: 101,
      user_id: 2,
      title: "Second Post"
    }
    const comment = {
      id: 101,
      post_id: 100,
      user_id: 1,
      title: "Post commment"
    }
    const postTitle = post.title;

    // Usage in setup() / composition API
    const acl = useAcl();

    if (acl.can.not('edit-post', post)) {
      console.log('User CAN edit post');
    } else {
      console.log('User CAN NOT edit post');
    }

    // console.log(acl)

    return { 
      post,
      post2,
      comment,
      postTitle
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
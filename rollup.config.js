// https://gautam1168.com/posts/rollup-vue-3/

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
// import auto from '@rollup/plugin-auto-install';
import resolve from '@rollup/plugin-node-resolve';
import VuePlugin from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import { terser } from "rollup-plugin-terser";


export default [
  // Vue 3
  {
    input: "src/VueSimpleAcl.js",
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.js",
        format: "umd",
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.umd.js",
        format: "umd"
      },      
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.esm.js",
        format: "es"
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.min.js",
        format: "iife"
      }
    ],
    plugins: [
      commonjs(),
      VuePlugin({
        css: false
      }),
      css(),
      // auto(),
      resolve(),
      terser(),
      alias({
        resolve: ['.js', '.ts'],
        entries: [
          { find: 'vue', replacement: 'vue' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: 'src/main.js',
      exclude: 'src/*.vue',
      exclude: 'node_modules/**'
    }
  },
  // Vue 2
  {
    input: "src/VueSimpleAcl.js",
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.js",
        format: "umd",
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.umd.js",
        format: "umd"
      },      
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.esm.js",
        format: "es"
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.min.js",
        format: "iife"
      }
    ],
    plugins: [
      commonjs(),
      VuePlugin({
        css: false
      }),
      css(),
      // auto(),
      resolve(),
      terser(),
      alias({
        resolve: ['.js', '.ts'],
        entries: [
          { find: 'vue', replacement: '@vue/composition-api' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: 'src/main.js',
      exclude: 'src/*.vue',
      exclude: 'node_modules/**'
    }
  }
]
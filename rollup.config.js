// https://gautam1168.com/posts/rollup-vue-3/

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
// import auto from '@rollup/plugin-auto-install';
import resolve from '@rollup/plugin-node-resolve';
import VuePlugin from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';
import { terser } from "rollup-plugin-terser";
// typescript support
import typescript from '@rollup/plugin-typescript';


export default [
  // Vue 3
  {
    input: "src/VueSimpleAcl.ts",
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.js",
        format: "umd",
        sourcemap: true
      },     
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.esm.js",
        format: "es",
        sourcemap: true
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.cjs.js",
        format: "cjs",
        sourcemap: true
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.min.js",
        format: "iife",
        sourcemap: true
      }
    ],
    plugins: [
      commonjs(),
      VuePlugin({
        css: false
      }),
      css(),
      // auto(),
      resolve({ browser: true}),
      terser(),
      typescript({
        exclude: ['src/main.ts', 'src/*.vue', 'node_modules/**']
        // use lib: and target: config in tsconfig.json
      }),
      alias({
        resolve: ['.js', '.ts'],
        entries: [
          { find: 'vue', replacement: 'vue' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: ['src/main.ts', 'src/*.vue', 'node_modules/**']
    }
  },
  // Vue 2
  {
    input: "src/VueSimpleAcl.ts",
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.js",
        format: "umd",
        sourcemap: true
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.esm.js",
        format: "es",
        sourcemap: true
      },      
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.cjs.js",
        format: "cjs",
        sourcemap: true
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.min.js",
        format: "iife",
        sourcemap: true
      }
    ],
    plugins: [
      commonjs(),
      VuePlugin({
        css: false
      }),
      css(),
      // auto(),
      resolve({ browser: true}),
      terser(),
      typescript({
        exclude: ['src/main.ts', 'src/*.vue', 'node_modules/**']
        // use lib: and target: config in tsconfig.json        
      }),
      alias({
        resolve: ['.js', '.ts'],
        entries: [
          { find: 'vue', replacement: '@vue/composition-api' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: ['src/main.ts', 'src/*.vue', 'node_modules/**']
    }
  }
]
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
    input: "src/index.ts",
    external: ['vue'],
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.js",
        format: "umd",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },     
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.esm.js",
        format: "es",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.cjs.js",
        format: "cjs",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.min.js",
        format: "iife",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
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
      (process.env.NODE_ENV === 'production' && terser()), // terser()
      typescript({
        exclude: ['node_modules/**', 'playground/**']
        // use lib: and target: config in tsconfig.json
      }),
      alias({
        resolve: ['.js', '.jsx', '.ts', '.tsx'],
        entries: [
          { find: 'vue', replacement: 'vue' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: ['node_modules/**', 'playground/**']
    }
  },
  // Vue 2
  {
    input: "src/index.ts",
    // external: ['vue'],
    output: [
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.js",
        format: "umd",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.esm.js",
        format: "es",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },      
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.cjs.js",
        format: "cjs",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
      },
      {
        name: 'VueSimpleAcl',
        file: "dist/vue-simple-acl.vue2.min.js",
        format: "iife",
        sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        globals: {
          vue: 'Vue'
        }
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
      (process.env.NODE_ENV === 'production' && terser()), // terser()
      typescript({
        exclude: ['node_modules/**', 'playground/**']
        // use lib: and target: config in tsconfig.json        
      }),
      alias({
        resolve: ['.js', '.jsx', '.ts', '.tsx'],
        entries: [
          { find: 'vue', replacement: '@vue/composition-api' }
        ]
      }),
    ],
    watch: {
      // include: 'src/**',
      exclude: ['node_modules/**', 'playground/**']
    }
  }
]
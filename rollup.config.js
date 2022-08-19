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
  {
    input: "src/index.ts",
    // external: ['vue'],
    output: [
      {
        name: 'VueSimpleAcl',
        format: 'esm',
        file: "dist/vue-simple-acl.mjs",
        // sourcemap: (process.env.NODE_ENV === 'production' ? false : 'inline'),
        // globals: {
        //   vue: 'Vue'
        // }
      },
      {
        name: 'VueSimpleAcl',
        format: 'cjs',
        file: "dist/vue-simple-acl.js",
      },
      {
        name: 'VueSimpleAcl',
        format: 'iife',
        file: "dist/vue-simple-acl.iife.js",
      },
      {
        name: 'VueSimpleAcl',
        format: 'es',
        file: "dist/vue-simple-acl.esm-browser.js",
      },
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
]
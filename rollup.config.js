// https://gautam1168.com/posts/rollup-vue-3/

import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import VuePlugin from 'rollup-plugin-vue';
import css from 'rollup-plugin-css-only';

export default {
  input: "src/VueSimpleAcl.js",
  output: {
    name: 'VueSimpleAcl',
    file: "dist/vue-simple-acl.esm.js",
    format: "es",
    // extend: true,
  },
  plugins: [
    commonjs(),
    VuePlugin({
      css: false
    }),
    css(),
    alias({
      resolve: [ '.js', '.ts' ],
      entries: [
        { find: 'vue', replacement: 'node_modules/vue/dist/vue.runtime.esm-browser.prod.js' }
      ]
    }),
       
  ],
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**'
  }
}

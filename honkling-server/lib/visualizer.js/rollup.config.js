import commonjs from 'rollup-plugin-commonjs';
import resolve  from 'rollup-plugin-node-resolve';

export default {
  //external: ['node-fetch'],
  plugins: [
    resolve(),
    commonjs()
  ]
};
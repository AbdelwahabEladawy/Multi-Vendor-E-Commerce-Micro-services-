const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const webpack = require('webpack');
const { join } = require('path');

module.exports = {
  target: 'node',

  externals: ({ request }, callback) => {
    if (
      request === '@prisma/client' ||
      request === '.prisma/client' ||
      request?.includes('@prisma') ||
      request?.includes('.prisma') ||
      request?.includes('query_compiler')
    ) {
      return callback(null, `commonjs ${request}`);
    }
    callback();
  },

  resolve: {
    alias: {
      './query_compiler_bg.js': false,
      './query_compiler_bg.wasm-base64.js': false,
    },
  },

  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/query_compiler_bg/,
    }),
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const config = {
  mode: 'production',
  entry: {
    'popup': './src/popup.js',
    'fullpage': './src/fullpage.js',
    'miniviz': './src/miniviz.js',
  },
  output: {
    filename: '[name].js',
    library: 'CarbonVue',
    type: 'window',
    path: path.resolve(__dirname, '../bundle')
  },
  watch: false,
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }, {
        test:/\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {url: false}
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].css'}),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false
    }),
  ]
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'inline-source-map';
  }
  return config;
};
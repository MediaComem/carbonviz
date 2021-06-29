const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const config = {
  mode: 'production',
  entry: './src/popup.js',
  output: {
    filename: 'popup.js',
    library: 'CarbonVue',
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
    new MiniCssExtractPlugin({filename: 'popup.css'}),
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
const path = require('path');

const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devServer: {
    open: true,
    hot: true,
    host: 'localhost',
    port: 20003,
    historyApiFallback: true,
  },
  mode: 'development',
  target: 'web',
  resolve: {
    alias: {
      react: require.resolve('preact/compat'),
      'react-dom': require.resolve('preact/compat'),
    },
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    }, {
      test: /\.sass$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [autoprefixer],
            },
          },
        },
        'sass-loader',
      ],
    }, {
      test: /\.(jpg|jpeg|png|gif|xml|ttf|eot|woff|woff2)$/,
      type: 'asset/resource',
    }, {
      test: /\.(glsl|fragment\.html)$/,
      type: 'asset/source',
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true,
        minifyJS: true,
      },
    }),
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.[fullhash].js',
    sourceMapFilename: 'bundle.[fullhash].js.map',
    publicPath: '/',
  },
};

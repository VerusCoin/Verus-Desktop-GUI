const webpack = require('webpack');
const path = require('path');

const DashboardPlugin = require('webpack-dashboard/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const jsSourcePath = path.join(__dirname, './src');
const buildPath = path.join(__dirname, './build');
const imgPath = path.join(__dirname, './src/assets/img');
const wwwPath = path.join(__dirname, './www');

// Common plugins

/*
* The CommonsChunkPlugin is an opt-in feature that creates a separate file (known as a chunk),
* consisting of common modules shared between multiple entry points.
* By separating common modules from bundles,
* the resulting chunked file can be loaded once initially,
* and stored in cache for later use.
* This results in pagespeed optimizations as the browser can quickly serve the shared code from cache,
* rather than being forced to load a larger bundle whenever a new page is visited.
*/
const plugins = [
  /*
  * The DefinePlugin allows you to create global constants which can be configured at compile time.
  * This can be useful for allowing different behaviour between development builds and release builds.
  * For example, you might use a global constant to determine whether logging takes place;
  * perhaps you perform logging in your development build but not in the release build.
  * That's the sort of scenario the DefinePlugin facilitates.
  */
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv),
    },
  }),
  new webpack.NamedModulesPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(wwwPath, 'index.html'),
    path: buildPath,
    filename: 'index.html',
    templateParameters: {
      isProduction,
    },
  }),
  new MiniCssExtractPlugin({
    filename: 'style.css',
  }),
];

// Common rules
const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
    },
  },
  {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'url-loader?limit=10000&mimetype=application/font-woff',
  },
  {
    test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    loader: 'file-loader',
  },
  {
    test: /\.(png|gif|jpg|svg)$/,
    include: imgPath,
    use: 'url-loader?limit=20480&name=assets/[name].[ext]',
  },
];

if (isProduction) {
  // Production plugins
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  );

  // Production rules
  rules.push(
    {
      test: /\.(sa|sc|c)ss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader',
      ],
    },
  );
} else {
  // Development plugins
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin(),
  );

  // Development rules
  rules.push(
    {
      test: /\.(sa|sc|c)ss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader?sourceMap',
      ],
    },
  );
}

module.exports = {
  // Production bundles must be compatible with a CSP that disallows eval.
  // Development retains full source maps for local debugging.
  devtool: isProduction ? false : 'source-map',
  context: jsSourcePath,
  entry: {
    js: ['@babel/polyfill', './index.js'],
  },
  output: {
    path: buildPath,
    publicPath: '',
    filename: 'app.js',
  },
  module: {
    rules,
  },
  resolve: {
    alias: {
      // The light player omits Lottie's expression evaluator. Shipped
      // animations are static assets and must never execute expressions.
      'lottie-web$': path.resolve(
        __dirname,
        'node_modules/lottie-web/build/player/lottie_light.js',
      ),
      // ASN.1 attempts to use Node's vm module only to create named
      // constructors and already falls back when that is unavailable.
      // Keep a browser vm evaluator out of the privileged renderer bundle.
      'vm$': path.resolve(jsSourcePath, 'util/security/noVm.js'),
    },
    extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
      jsSourcePath,
    ],
  },
  plugins,
  devServer: {
    contentBase: isProduction ? './build' : './src',
    historyApiFallback: true,
    port: 3000,
    compress: isProduction,
    inline: !isProduction,
    hot: !isProduction,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      },
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        sourceMap: !isProduction,
        terserOptions: {
          warnings: false,
          compress: {
            ie8: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  stats: { children: false },
};

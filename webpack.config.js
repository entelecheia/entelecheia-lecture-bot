/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const dotenv = require('dotenv')

dotenv.config()

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: {
      content: './src/content/index.tsx',
      background: './src/background/index.ts',
      options: './src/options/index.tsx',
      popup: './src/popup/index.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].js',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
        },
        {
          test: /\.png$/,
          type: 'asset/inline',
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/options/index.html',
        filename: 'options.html',
        chunks: ['options'],
      }),
      new HtmlWebpackPlugin({
        template: './src/popup/index.html',
        filename: 'popup.html',
        chunks: ['popup'],
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: '[name].css',
          chunkFilename: '[id].css',
        }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/favicon.png', to: 'favicon.png' },
          { from: 'src/_locales', to: '_locales' },
        ],
      }),
      isProduction &&
        new ZipPlugin({
          path: '../',
          filename: 'chromium.zip',
        }),
    ].filter(Boolean),
    devServer: {
      contentBase: path.join(__dirname, 'build'),
      compress: true,
      port: 9000,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
  }
}

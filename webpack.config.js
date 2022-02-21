const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/main/index.ts',
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'png', to: 'png' },
        { from: 'public', to: '.' }
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  stats: {
    errorDetails: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'build'),
    },
    compress: true,
    port: 3000,
    client: {
      logging: 'none'
    }
  },
};

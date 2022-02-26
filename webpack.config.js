const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main/index.ts',
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { modules: true } }
        ]
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
    new HtmlWebpackPlugin({
      template: 'html/index.html'
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  stats: {
    errorDetails: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    client: {
      logging: 'none',
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
};

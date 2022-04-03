const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        test: /\.png$/i,
        type: 'asset/inline'
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]-[local]'
              }
            },
          }
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'html/index.html'
    }),
    new PreloadWebpackPlugin({
      preload: 'all'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' }
      ],
      options: {
        concurrency: 100,
      },
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css'],
  },
  output: {
    filename: '[id].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  performance: {
    hints: false,
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
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
  }
};

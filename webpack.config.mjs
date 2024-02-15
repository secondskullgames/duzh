import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  entry: './src/main/index.ts',
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/i,
        type: 'asset/inline'
      },
      {
        test: /\.json$/i,
        use: 'glob-import-loader'
      }
    ],
  },
  plugins: [
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
    extensions: ['.ts', '.js', '.css'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('build'),
    publicPath: '',
    clean: true,
    globalObject: 'this' // WTF, webpack
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
      directory: path.join('public'),
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

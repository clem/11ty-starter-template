const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const PurgeCssPlugin = require('purgecss-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = (env, argv) => ({
  target: 'web',
  entry: {
    main: './src/_assets/js/main.js',
    styles: './src/_assets/scss/main.scss'
  },
  output: {
    chunkLoading: false,
    wasmLoading: false,
    path: path.resolve(__dirname, '_site/js'),
    filename: '[name].js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/main.css'
    }),
    new FixStyleOnlyEntriesPlugin(),
    new PurgeCssPlugin({
      paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
      keyframes: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('dart-sass'),
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(svg|jpg|gif|png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: (url, resourcePath, context) => {
                if(argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath);
                  return `/${relativePath}`;
                }
                return `/img/${path.basename(resourcePath)}`;
              }
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: (url, resourcePath, context) => {
                if(argv.mode === 'development') {
                  const relativePath = path.relative(context, resourcePath);
                  return `/${relativePath}`;
                }
                return `/fonts/${path.basename(resourcePath)}`;
              }
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [new CssMinimizerPlugin()],
  },
});

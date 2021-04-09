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
  entry: {
    styles: './src/_assets/css/main.css'
  },
  output: {
    path: path.resolve(__dirname, '_site')
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '/css/main.css'
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
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src/_assets/'),
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
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

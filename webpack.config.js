const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin'); // для копирования содержимого папки  assets

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const  filename = (ext) => isDev ? `[name].${ext}`: `[name].[contenthash].${ext}`;

const optimization = () => {
  const configObj = {
    splitChunks:{
      chunks: 'all'
    }
  };

  if (isProd) {
    configObj.minimizer = [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ];
  }

  return configObj;
};

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode:'development', 
    entry: './js/main.js',
    output: {
        filename: `./js/${filename('js')}`,
        path: path.resolve(__dirname, 'app'),
        clean: true,
    },
    devServer: {
        historyApiFallback: true,
        static: {
            directory: path.resolve(__dirname, 'app'),
        },
        open: true,
        compress: true,
        hot: true,
        port: 3000,
    },
    optimization: optimization(),
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'), //откуда 
            filename: 'index.html',
            minify:{
                collapseWhitespace: isProd//убирать пробелы
            },
        }),
        new MiniCssExtractPlugin({
            filename: `./css/${filename('css')}`,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {from: path.resolve(__dirname, 'src/assets'), to: path.resolve(__dirname, 'app')}
            ]
        }),
    ],
    devtool: isProd ? false : 'source-map', 
    module: {
        rules: [
          {
            test: /\.html$/,
            use: "html-loader",
          },
          {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
          },
          {
            test: /\.s[ac]ss$/,
            use: [
                {
                 loader: MiniCssExtractPlugin.loader,
                 options: {
                    publicPath: (resourcePath, context) => {
                        return path.relative(path.dirname(resourcePath), context) + '/'; //для подклчение картинок через css
                    },
                 }
                },
                "css-loader", 
                "sass-loader"],
          },
          {
            test: /\.(?:ico|gif|png|jpe?g|svg)$/i,
            type: 'asset/resource',
            generator: {
            filename: () => {
                return isDev ? 'img/[name][ext]' : 'img/[name].[contenthash][ext]';
            }
            }
          },
          {
            test: /\.js$/,
            exclude: /node_modules/, // не обрабатываем файлы из node_modules
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true, // Использование кэша для избежания рекомпиляции
                // при каждом запуске
              },
            },
          },
        ],
    },
}
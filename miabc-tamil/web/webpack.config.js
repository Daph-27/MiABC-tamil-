const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname, '..');

const babelLoaderConfiguration = {
    test: /\.(js|jsx|ts|tsx)$/,
    include: [
        path.resolve(appDirectory, 'index.js'),
        path.resolve(appDirectory, 'src'),
        path.resolve(appDirectory, 'node_modules/react-native-uncompiled'),
        path.resolve(appDirectory, 'node_modules/react-native-reanimated'),
        path.resolve(appDirectory, 'node_modules/react-native-gesture-handler'),
    ],
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            presets: ['@react-native/babel-preset'],
            plugins: ['react-native-web'],
        },
    },
};

const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|png|svg)$/,
    use: {
        loader: 'url-loader',
        options: {
            name: '[name].[ext]',
            esModule: false,
        },
    },
};

module.exports = {
    entry: path.resolve(appDirectory, 'index.js'),
    output: {
        path: path.resolve(appDirectory, 'dist'),
        filename: 'bundle.web.js',
    },
    resolve: {
        extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx'],
        alias: {
            'react-native$': 'react-native-web',
        },
    },
    module: {
        rules: [
            babelLoaderConfiguration,
            imageLoaderConfiguration,
            {
                test: /\.m?[jt]sx?$/,
                resolve: {
                    fullySpecified: false,
                },
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(appDirectory, 'web/index.html'),
        }),
    ],
};

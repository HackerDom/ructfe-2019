const path = require('path');
const webpack = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    const plugins = [];
    let options = {};

    if (!isProduction) {
        plugins.push(new WebpackAssetsManifest());
        options = Object.assign(options, {
            output: {
                path: path.resolve(__dirname, 'static', 'build'),
                filename: '[name].js',
            }
        });
    } else {
        plugins.push(new WebpackAssetsManifest());
        options = Object.assign(options, {
            output: {
                path: path.resolve(__dirname, 'static', 'build'),
                filename: '[name].[hash].js'
            }
        });
    }

    return Object.assign({
        plugins,
        entry: {
            main: './frontend/App.jsx'
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: ['babel-loader'],
                },
                {
                    test: /.less$/,
                    use: [{
                        loader: 'style-loader',
                    }, {
                        loader: 'css-loader',
                    }, {
                        loader: 'less-loader',
                    }],
                },
                {
                    test: /.css$/,
                    use: [{
                        loader: 'style-loader',
                    }, {
                        loader: 'css-loader',
                    }],
                },
            ],
        },
        resolve: {
            extensions: ['*', '.js', '.jsx'],
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true
                    }
                }
            }
        }
    }, options);
};

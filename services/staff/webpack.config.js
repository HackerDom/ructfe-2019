const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const bundleOutputDir = './dist';
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);
    return {
        stats: { modules: false },
        entry: { main: './src/client/index.jsx' },
        resolve: { extensions: ['.js', '.jsx'] },
        devServer: {
            port: 3000
        },
        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: 'index_bundle.js'
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    include: /src/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/react', '@babel/env']
                        }
                    }
                }, {
                    test: /\.css$/,
                    use: ExtractTextPlugin.extract({
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    // modules: true,
                                    importLoaders: 1,
                                    modules: {
                                        localIdentName: '[name]_[local]_[hash:base64:5]'
                                    }
                                }
                            },
                            {
                                loader: 'typed-css-modules-loader',
                                options: {
                                    camelCase: true
                                }
                            }]
                    })
                }, {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    use: 'url-loader?limit=25000'
                }
            ]
        },
        plugins: (isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            }),
            new ExtractTextPlugin({ filename: './style_bundle.css', allChunks: true }),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/client/public/index.html'
            }),
            new CopyWebpackPlugin([
                { from: './src/client/public/favicon', to: './favicon' },
                { from: './src/client/public/manifest', to: './manifest' },
                { from: './src/client/public/styles', to: './styles' }
            ])
        ] : [
            // Plugins that apply in production builds only
            new webpack.optimize.UglifyJsPlugin(),
            new ExtractTextPlugin('site.css')
        ])
    };
};

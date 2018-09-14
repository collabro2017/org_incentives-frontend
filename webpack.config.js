const path = require('path');
const webpack = require('webpack');
const autoPrefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    chunksSortMode: 'dependency',
    inject: 'body'
});

function isVendor(module) {
    return module.context && module.context.indexOf('node_modules') !== -1;
}

const VendorChunkConfig = new webpack.optimize.CommonsChunkPlugin({
    names: ['vendor'],
    minChunks: function (module, count) {
        // creates a common vendor js file for libraries in node_modules
        return isVendor(module);
    }
});

const LoaderOptions = new webpack.LoaderOptionsPlugin({
    options: {
        postcss: [
            autoPrefixer(),
        ]
    }
});

let babelOptions = {
    "presets": "es2015"
};

module.exports = function(env) {
    const NODE_ENV = env.NODE_ENV;
    const AUTH_REDIRECT_URL = env.AUTH_REDIRECT_URL;
    const PILOT = env.PILOT;
    const VERSION_ID = env.VERSION_ID;

    if (NODE_ENV !== 'development' && NODE_ENV !== 'test' && NODE_ENV !== 'staging' && NODE_ENV !== 'production' && NODE_ENV !== 'development-local' && NODE_ENV !== 'development') {
        throw new Error('NODE_ENV not set!');
    }

    return {
        entry: ['babel-polyfill', 'whatwg-fetch', './src/index.tsx'],
        output: {
            path: path.resolve('dist'),
            filename: '[name].js',
            publicPath: '/'
        },
        devtool: 'source-map',
        devServer: {
            historyApiFallback: true
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        },
                        {
                            loader: 'ts-loader'
                        }
                    ]
                }, {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        }
                    ]
                },
                {
                    test: /\.less/,
                    use: ['style-loader', 'css-loader', 'less-loader', 'postcss-loader']
                },
                {
                    test: /\.css/,
                    use: ['style-loader', 'css-loader', 'postcss-loader']
                }
            ]
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"]
        },
        plugins: [HtmlWebpackPluginConfig, VendorChunkConfig, LoaderOptions, new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(NODE_ENV),
                AUTH_REDIRECT_URL: JSON.stringify(AUTH_REDIRECT_URL),
                PILOT: JSON.stringify(PILOT),
                VERSION_ID: JSON.stringify(VERSION_ID)
            }
        })]
    }
};

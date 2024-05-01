const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const config = merge(common, {
  devtool: "inline-source-map",
	// devServer: {
	// 	open: true,
	// 	host: 'localhost',
	// 	historyApiFallback: true,
	// 	hot: true,
	// },
	devServer: {
		static: './dist'
	},
	mode: "development",
});

module.exports = config;
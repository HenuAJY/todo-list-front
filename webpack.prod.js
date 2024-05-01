const { merge } = require("webpack-merge");
const common = require("./webpack.common");

const config = merge(common, {
  mode: "production",
  output: {
    filename: "[name].[contenthash].js",
  },
});

module.exports = config;
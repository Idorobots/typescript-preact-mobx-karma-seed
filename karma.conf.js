"use strict";

process.env.TEST = true;

module.exports = (karma) => {
  const coverage = karma.singleRun ? ["coverage"] : [];

  karma.set({

    frameworks: [
      "browserify",
      "jasmine",
    ],

    files: ["src/**/*.spec.ts?(x)"],

    preprocessors: {
      "src/**/*.ts?(x)": ["browserify"]
    },

    browserify: {
      debug: true,
      plugin: [
        "tsify",
        ["css-modulesify", {
          before: [ // order matters
            require("postcss-cssnext"),
            require("postcss-custom-properties"),
            require("postcss-import"),
            require("postcss-color-function"),
            require("postcss-assets")({
              loadPaths: ["src/"]
            }),
            require("postcss-camel-case"),
            require("postcss-modules-local-by-default"),
          ],
        }],
      ],
      transform: [
        ["babelify", {
          extensions: [".ts", ".tsx"],
          plugins: [
            "transform-object-assign",
            ["transform-react-jsx", { "pragma":"preact.h" }]
          ],
          presets: ["es2015"],
          sourceMaps: true,
        }]
      ]
    },

    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },

    reporters: ["progress"],

    customLaunchers: {
      HeadlessChrome: {
        base: "Chrome",
        flags: [
          "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream",
          "--user-data-dir=/tmp/data", "--headless", "--disable-gpu",
          "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222",
        ],
      },
    },

    port: 9999,
    colors: true,
    logLevel: karma.LOG_INFO,
    autoWatch: true,
    browsers: [
      "Chrome",
      "Firefox",
    ],
    captureTimeout: 6000,
  });
};

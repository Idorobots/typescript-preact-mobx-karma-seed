"use strict";

const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const chalk = require("chalk");
const connect = require("gulp-connect");
const glob = require("glob");
const gulp = require("gulp");
const gutil = require("gulp-util");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const sourcemaps = require("gulp-sourcemaps");
const tslint = require("gulp-tslint");
const uglify = require("gulp-uglify");
const DtsCreator = require("typed-css-modules");

(function () {
  const connectReload = connect.reload;
  let waiting = false;
  connect.reload = function throttledReload () {
    if (!waiting) {
      waiting = true;
      setTimeout(() => { waiting = false; }, 2000);
      return connectReload.call(connect);
    } else {
      return require("through2").obj();
    }
  }
})();

gulp.task("bundle", ["style-type-definitions", "lint"], () => {
  const prod = process.env.ENV === "prod";
  const postcss = [ // order matters
    require("postcss-cssnext"),
    require("postcss-custom-properties"),
    require("postcss-import"),
    require("postcss-color-function"),
    require("postcss-assets")({
      loadPaths: ["src/"]
    }),
    require("postcss-camel-case"),
    require("postcss-modules-local-by-default"),
  ];
  if (prod){
    postcss.push(require('postcss-clean'));
  }
  const bundle = browserify("src/app/index.tsx", { debug: !prod })
    .plugin(require("tsify"))
    .plugin(require("css-modulesify"), {
      before: postcss,
      global: true,
      output: "./dist/main.css",
      rootDir: __dirname,
    })
    .transform(require("babelify"), {
      extensions: [".ts", ".tsx"],
      plugins: [
        "transform-object-assign",
        ["transform-react-jsx", { "pragma":"preact.h" }]
      ],
      presets: ["es2015"],
      sourceMaps: true,
    })
    .bundle()
    .on("error", gutil.log)
    .pipe(source("main.js"))
    .pipe(buffer());
  if (prod) {
    bundle
      .pipe(uglify());
  } else {
    bundle
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write());
  }
  bundle
    .pipe(gulp.dest("./dist/"))
    .pipe(connect.reload());
});

gulp.task("tslint", () => {
  gulp
    .src(["src/**/*.ts", "src/**/*.tsx"])
    .on("error", gutil.log)
    .pipe(tslint({
      fix: true,
      formatter: "verbose",
    }))
    .pipe(tslint.report());
});

gulp.task("lint", ["tslint"]);

gulp.task("style-type-definitions", (done) => {
  let creator = new DtsCreator({
    camelCase: true,
    searchDir: "./src"
  });
  glob("./src/**/*.css", null, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    if (!files || !files.length) return;
    Promise
      .all(files.map((f) => {
        return creator
          .create(f)
          .then((content) => content.writeFile())
          .then((content) => {
            console.log("Wrote " + chalk.green(content.outputFilePath));
            content.messageList.forEach((message) => {
              console.warn(chalk.yellow("[Warn] " + message));
            });
          })
          .catch((reason) => console.error(chalk.red("[Error] " + reason)));
      }))
      .then(() => done());
  });
});

gulp.task("html", () => {
  gulp
    .src(["src/index.html"])
    .on("error", gutil.log)
    .pipe(gulp.dest("./dist/"))
    .pipe(connect.reload());
});

gulp.task("server", () => {
  connect.server({
    host: "0.0.0.0",
    livereload: true,
    port: 8888,
    root: "dist/",
  });
});

gulp.task("watch", ["html", "bundle", "server"], () => {
  gulp.watch("src/**/*.*", ["html", "bundle"]);
});

gulp.task("default", ["html", "bundle"]);

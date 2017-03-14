const gulp          = require('gulp'),                  // The streaming build system
      AssetsPlugin  = require('assets-webpack-plugin'), // Emits a json file with assets paths
      browserSync   = require('browser-sync'),          // Live CSS Reload & Browser Syncing
      cache         = require('gulp-cache'),            // A cache proxy plugin for gulp
      cheerio       = require('gulp-cheerio'),          // Manipulate HTML and XML files with Cheerio in Gulp.
      combine       = require('stream-combiner2').obj,  // This is a sequel to [stream-combiner](https://npmjs.org/package/stream-combiner) for streams3.
      csso          = require('gulp-csso'),             // Minify CSS with CSSO.
      del           = require('del'),                   // Delete files and folders
      environments  = require('gulp-environments'),     // A library for easily adding environments (development/production) to Gulp
      fs            = require('fs'),                    // File System
      gulpIf        = require('gulp-if'),               // Conditionally run a task
      gulplog       = require('gulplog'),               // Logger for gulp and gulp plugins
      htmlmin       = require('gulp-html-minifier'),    // Minify HTML with html-minifier.
      htmlmininline = require('gulp-minify-inline'),    // Gulp plugin to uglify inline JS and minify inline CSS
      imagemin      = require('gulp-imagemin'),         // Minify PNG, JPEG, GIF and SVG images
      named         = require('vinyl-named'),           // Give vinyl files chunk names.
      newer         = require('gulp-newer'),            // Only pass through newer source files
      notify        = require('gulp-notify'),           // Gulp plugin to send messages based on Vinyl Files or Errors to Mac OS X, Linux or Windows using the node-notifier module. Fallbacks to Growl or simply logging
      plumber       = require('gulp-plumber'),          // Prevent pipe breaking caused by errors from gulp plugins
      pngquant      = require('imagemin-pngquant'),     // Pngquant imagemin plugin
      postcss       = require('gulp-postcss'),          // Pipe CSS through PostCSS processors with a single parse
      pug           = require('gulp-pug'),              // Gulp plugin for compiling Pug templates
      rename        = require('gulp-rename'),           // Rename files
      replace       = require('gulp-replace'),          // A string replace plugin for gulp
      rev           = require('gulp-rev'),              // Static asset revisioning by appending content hash to filenames: unicorn.css => unicorn-d41d8cd98f.css
      revReplace    = require('gulp-rev-replace'),      // Rewrite occurences of filenames which have been renamed by gulp-rev
      sass          = require('gulp-sass'),             // Gulp plugin for sass
      scss          = require('postcss-scss'),          // SCSS parser for PostCSS.
      shorthand     = require('gulp-shorthand'),        // Makes your CSS files lighter and more readable
      sourcemaps    = require('gulp-sourcemaps'),       // Source map support for Gulp.js
      spritesmith   = require('gulp.spritesmith'),      // Convert a set of images into a spritesheet and CSS variables via gulp
      stylelint     = require('stylelint'),             // A mighty, modern CSS linter.
      svgSprite     = require('gulp-svg-sprite'),       // Convert SVG files to symbols with gulp
      svgmin        = require('gulp-svgmin'),           // Minify SVG files with gulp.
      uglify        = require('gulp-uglify'),           // Minify files with UglifyJS
      uncss         = require('gulp-uncss'),            // Remove unused CSS selectors.
      webpack       = require('webpack'),               // Webpack
      webpackStream = require('webpack-stream');        // Run webpack through a stream interface

let project = {
  pablicPath: "http://zanusilker.github.io/gulpimize", // You need to input path your project without '/' on end. Example "http://zanusilker.github.io/gulpimize"
};

let path = require("./path");

let precss          = require('precss'),
    important       = require('postcss-important-shorthand'),
    pxtorem         = require('postcss-pxtorem')({
      rootValue: 16,               // (Number) The root element font size.
      unitPrecision: 5,            // (Number) The decimal numbers to allow the REM units to grow to.
      propWhiteList: [],           // (Array) The properties that can change from px to rem.
      selectorBlackList: ['html'], // (Array) The selectors to ignore and leave as px.
      replace: true,               // (Boolean) replaces rules containing rems instead of adding fallbacks.
      mediaQuery: true,            // (Boolean) Allow px to be converted in media queries.
      minPixelValue: 4             // (Number) Set the minimum pixel value to replace.
    }),
    discardComments = require('postcss-discard-comments')({
      removeAll: true
    }),
    mqpacker        = require('css-mqpacker'),
    cssnext         = require('postcss-cssnext')({
      browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7']
    }),
    assets          = require('postcss-assets')({
      loadPaths: ['./app/img/'],
      relativeTo: './app/css/'
    }),
    extend          = require('postcss-extend'),
    short           = require('postcss-short'),
    sorting         = require('postcss-sorting'),
    flexbugs        = require('postcss-flexbugs-fixes');

const processors = [
  precss, important, pxtorem, discardComments, assets, extend, cssnext, short, mqpacker, sorting, flexbugs
];

let isDevelopment = true,
    development = environments.development,
    production  = environments.production;

/**
  * Run local server from a specified folder
  */

gulp.task('server', () => {
  browserSync({
    server: {
      baseDir: path.dist.folder
    },
    notify: false
  });
});

/**
  * Сompile your Pug templates into HTML  *
  */

gulp.task('pug', () => {

  // Include JSON with data for html
  const YOUR_LOCALS = path.app.html.data.file;

  return gulp.src(path.app.html.pages.allFiles)
    .pipe(plumber({
        errorHandler: notify.onError((err) => {
          return {
            title: 'pug',
            message: err.message
          }
        })
      }))
    .pipe(pug({
      locals: JSON.parse(fs.readFileSync(YOUR_LOCALS, 'utf-8')),
      pretty: '  '
    }))
    .pipe(production(combine(
      revReplace({
        manifest: gulp.src(path.app.manifest.allFiles, {allowEmpty: true})
      }),
      // The next code removes html comments
      replace(/<!--.*-->/g, ''),
      // The next code removes empty lines
      replace(/^\s*\n/mg, ''),
      // The next code minifies inline CSS and JS
      htmlmininline(),
      // The next code minifies HTML
      htmlmin({collapseWhitespace: true})
    )))
    .pipe(gulp.dest(path.dist.folder))
    .pipe(browserSync.reload({stream: true}));

});

/**
  * Сompile your PostCSS templates into CSS
  */

gulp.task('css:main', () => {
  return gulp.src(path.app.css.files.style)
    .pipe(plumber({
      errorHandler: notify.onError((err) => {
        return {
          title: 'css:main',
          message: err.message
        }
      })
    }))
    .pipe(development(sourcemaps.init()))
      .pipe(postcss(processors, {
        syntax: scss
      }))
      .pipe(shorthand())
      // The next code removes empty lines
      .pipe(replace(/^\s*\n/mg, '\n'))
      .pipe(rename({extname: '.css'}))
      .pipe(production(combine(csso(), rev())))
    .pipe(development(sourcemaps.write()))
    .pipe(gulp.dest(path.dist.css.folder))
    .pipe(production(combine(rev.manifest('css.json'), gulp.dest(path.app.manifest.folder))))
    .pipe(browserSync.reload({stream: true}));
});

/**
  * Build all the libraries in one file and minify them
  */

gulp.task('css:libs', () => {
  return gulp.src(path.app.css.files.libs)
    .pipe(plumber({
      errorHandler: notify.onError((err) => {
        return {
          title: 'css:libs',
          message: err.message
        }
      })
    }))
    .pipe(development(sourcemaps.init()))
      .pipe(postcss(processors, {
        syntax: scss
      }))
      // .pipe(uncss({
      //   html: [path.dist.html.allFiles]
      // }))
      .pipe(rename({extname: '.css'}))
      .pipe(production(combine(
        csso(),
        rev(),
        // The next code removes css comments
        replace(/\/\*[\s\S]*?\*\//g, ''),
        // The next code removes empty lines
        replace(/^\s*\n/mg, '')
      )))
    .pipe(development(sourcemaps.write()))
    .pipe(gulp.dest(path.dist.css.folder))
    .pipe(production(combine(rev.manifest('libs-css.json'), gulp.dest(path.app.manifest.folder))))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * A mighty, modern CSS linter that helps you enforce consistent conventions and avoid errors in your stylesheets.
 */

const stylelintrc = require('./stylelint.config');

gulp.task('css:stylelint', () => {
  return gulp.src(path.app.css.allFiles)
    .pipe(plumber({
      errorHandler: notify.onError((err) => {
        return {
          title: 'css:stylelint',
          message: err.message
        }
      })
    }))
    .pipe(postcss([stylelint(stylelintrc)], {
      syntax: scss
    }));
});

/**
 * Gulp + Webpack = ♡
 */

gulp.task('js:webpack', (callback) => {

  const NODE_ENV = isDevelopment ? 'development' : 'production'; // Set environments
  let firstBuildReady = false;

  function done(err, stats) {
    firstBuildReady = true;

    if (err) { // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
      return;  // emit('error', err) in webpack-stream
    }

    gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
      colors: true
    }));

  }

  // Options related to how webpack emits results
  let options = {
    output: {
      library: '[name]', // The name of the exported library
      publicPath: (project.pablicPath && !isDevelopment) ? project.pablicPath + '/js/' : '/js/', // If it's production and will be upload on sever then full path, another way '/js/'
      filename: isDevelopment ? '[name].js' : '[name]-[hash:10].js', // The filename template for entry chunks
      chunkFilename: isDevelopment ? '[name].js' : '[name]-[hash:10].js' // The filename template for additional chunks
    },
    watch: isDevelopment, // Turn on watch mode. This means that after the initial build, webpack will continue to watch for changes in your js
    watchOptions: {
      aggregateTimeout: 100 // Add a delay before rebuilding once the first file changed.
    },
    devtool: isDevelopment ? 'cheap-inline-module-source-map' : false,
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader?presets[]=env'
        }
      ]
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify(NODE_ENV)
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'commons', // The chunk name of the commons chunk.
        filename: 'commons.js', // The filename template for the commons chunk.
        minChunks: 2 // The minimum number of chunks which need to contain a module before it's moved into the commons chunk.
      })
    ]
  };

  if (!isDevelopment) {

    options.plugins.push(new AssetsPlugin({
      filename: 'webpack.json',
      path: path.app.manifest.folder,
      processOutput(assets) {
        for (let key in assets) {
          if (assets.hasOwnProperty(key)) {
            assets[key + '.js'] = assets[key].js.slice(options.output.publicPath.length);
            delete assets[key];
          }
        }
        return JSON.stringify(assets);
      }
    }));

  }

  console.info(`Your public path - ${options.output.publicPath}`);

  return gulp.src(path.app.js.allFiles)
    .pipe(plumber({
      errorHandler: notify.onError((err) => {
        return {
          title: 'js:webpack',
          message: err.message
        }
      })
    }))
    .pipe(named())
    .pipe(webpackStream(options, webpack, done))
    .pipe(production(uglify()))
    .pipe(gulp.dest(path.dist.js.folder))
    .on('data', () => {
      if (firstBuildReady && !callback.called) {
        callback.called = true;
        callback();
      }
    });

});

/**
 * Minifies all the images
 */

gulp.task('img', () => {
  return gulp.src(path.app.img.allFiles, {since: gulp.lastRun('img')})
    .pipe(plumber({
    errorHandler: notify.onError((err) => {
      return {
        title: 'img',
        message: err.message
      }
    })
  }))
    .pipe(newer(path.dist.img.folder))
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest(path.dist.img.folder));
});

/**
 * Create image sprite
 */

gulp.task('img:sprites', () => {
  let spriteData = gulp.src(path.app.sprite.allImg).pipe(spritesmith({
    imgName:   'sprite.png',
    cssName:   'sprite.css',
    cssFormat: 'css',
    imgPath:   '../img/sprite.png',
    padding:   70
  }));
  // CSS file will direct to './app/css/'. Sprite.png file will direct to './app/img/'
  return spriteData.pipe(gulpIf('*.css', gulp.dest(path.app.css.folder), gulp.dest(path.dist.img.folder)))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Create svg sprite
 */

gulp.task('svg:sprites', () => {
  return gulp.src(path.app.sprite.allSvg)
  .pipe(plumber({
    errorHandler: notify.onError((err) => {
      return {
        title: 'svg',
        message: err.message
      }
    })
  }))
  // Minify svg here
  .pipe(svgmin({
    js2svg: {
      pretty: true
    }
  }))
  // Remove all fill, style and stroke declarations in out shapes
  .pipe(cheerio({
    run: ($) => {
      $('[fill]').removeAttr('fill');
      $('[stroke]').removeAttr('stroke');
      $('[style]').removeAttr('style');
    },
    parserOptions: {xmlMode: true}
  }))
  // Cheerio plugin create unnecessary string '&gt;', so replace it.
  .pipe(replace('&gt;', '>'))
  // Build svg sprite
  .pipe(svgSprite({
    mode: {
      symbol: {
        sprite: '../sprite.svg',
        render: {
          scss: {
            dest: '../svg-symbols.scss',
            template: './app/css/_sprite_template.scss'
          }
        }
      }
    }
  }))
  .pipe(gulpIf('*.scss', combine(sass({outputStyle: 'expanded'}), gulp.dest(path.app.css.folder)), gulp.dest(path.dist.img.folder)))
  .pipe(browserSync.reload({stream: true}));
});

gulp.task('assets', () => {
  return gulp.src(path.app.htaccess)
    .pipe(gulp.dest(path.dist.folder))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Deleted folder 'dist'
 */

gulp.task('del', () => {
  return del(path.dist.folder);
});

/**
 * Set environments as production
 */

gulp.task('set-prod', () => {
  return new Promise((resolve, reject) => {
    environments.current(production);
    resolve();
  });
});

/**
 * Show the current environments
 */

gulp.task('env', () => {
  return new Promise((resolve, reject) => {
    console.log(` development - ${environments.development()} \n production  - ${environments.production()} `);
    isDevelopment = environments.development(); // Set environments as development
    resolve();
  });
});

gulp.task('watch', () => {
  gulp.watch(path.app.html.allFiles, gulp.series('pug'));
  gulp.watch(path.app.css.allFiles, gulp.series('css:main'));
  gulp.watch(path.app.css.files.libs, gulp.series('css:libs'));
  gulp.watch(path.app.img.allFiles, gulp.series('img'));
  gulp.watch(path.app.sprite.allFiles, gulp.series('img:sprites', 'svg:sprites'));
  gulp.watch(path.dist.js.allFiles).on('change', browserSync.reload);
});

/**
 * Development
 */

gulp.task(
  'default',
  gulp.series(
    'env', 'del',
    gulp.parallel(
      'img:sprites', 'svg:sprites', 'assets', 'css:libs', 'css:main', 'img', 'js:webpack'
    ),
    gulp.series('pug'),
    gulp.parallel('server', 'watch')
  )
);

/**
 * Production
 */

gulp.task('production', gulp.series('set-prod', 'default'));

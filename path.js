module.exports = path = {
  folder: '.',
  app:  {
    folder:   './app/',
    allFiles: './app/**/*',
    htaccess: './app/.htaccess',
    html: {
      folder:   './app/html/',
      allFiles: './app/html/**/*.{pug,jade}',
      data: {
        folder: './app/html/data/',
        file:   './app/html/data/content.json'
      },
      pages: {
        folder:   './app/html/pages/',
        allFiles: './app/html/pages/*.{pug,jade}'
      }
    },
    css: {
      folder:   './app/css/',
      allFiles: './app/css/**/*.{css,pcss}',
      main:   './app/css/*.{css,pcss}',
      mixins: './app/css/mixins/*.pcss',
      components: './app/css/components/*.pcss',
      files: {
        style:  './app/css/pages/*.pcss',
        header: './app/*.scss',
        base:   './app/css/_base.pcss',
        libs:   './app/css/libs.pcss'
      }
    },
    js: {
      folder:   './app/js/',
      allFiles: './app/js/*.js',
      files: {
        js:  './app/js/login.js'
      }
    },
    libs: {
      folder: './app/libs/'
    },
    img: {
      folder:   './app/img/',
      allImg: './app/img/**/*.{png, jpg}',
      allFiles: './app/img/**/*',
      svg: './app/img/**/*.svg'
    },
    sprite: {
      allImg: './app/sprite/**/*.{png, jpg}',
      allSvg: './app/sprite/**/*.svg'
    },
    fonts: {
      folder:    './app/fonts/',
      allFiles:  './app/fonts/**/*',
      woffFiles: './app/fonts/**/*.{woff,woff2}',
      woff:      './app/fonts/**/*.woff',
      woff2:     './app/fonts/**/*.woff2'
    },
    manifest : {
      folder:   './app/manifest/',
      allFiles: ['./app/manifest/css.json', './app/manifest/libs-css.json', './app/manifest/webpack.json']
    }
  },
  dist: {
    folder:   './dist/',
    allFiles: './dist/**/*',
    html:{
      allFiles: './dist/*.html'
    },
    css: {
      folder: './dist/css/',
      allFiles: './dist/css/**/*'
    },
    js:{
      folder: './dist/js/',
      allFiles: './dist/js/**/*'
    },
    libs: {
      folder: './dist/libs/',
      allFiles: './dist/libs/**/*'
    },
    img: {
      folder: './dist/img/',
      allFiles: './dist/img/**/*'
    },
    fonts: {
      folder: './dist/fonts/',
      allFiles: './dist/fonts/**/*'
    }
  }
};
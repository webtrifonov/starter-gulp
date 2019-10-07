const jsLibsSources = [
    'node_modules/jquery/dist/jquery.min.js'
    //'node_modules/mmenu-js/dist/mmenu.js', //npm i mmenu-js
    //'node_modules/magnific-popup/dist/jquery.magnific-popup.js', //npm i magnific-popup
    //'', //npm i owl.carousel
];
const jsLibsName = 'libs.min.js';

const gulp             = require('gulp'),
      autoprefixer     = require('gulp-autoprefixer'),
      sass             = require('gulp-sass'),
      browserSync      = require('browser-sync').create(),
      cleanCss         = require('gulp-clean-css'),
      sourcemaps       = require('gulp-sourcemaps'),
      concat           = require('gulp-concat'),
      uglify           = require('gulp-uglify'),
      rename           = require('gulp-rename'),
      del              = require('del'),
      imagemin         = require('gulp-imagemin'),
      pngquant         = require('imagemin-pngquant'),
      cache            = require('gulp-cache'),
      browserify       = require('browserify'),
      babelify         = require('babelify'),
      source           = require('vinyl-source-stream'),
      buffer           = require('vinyl-buffer');
function BSreload(done) {
    browserSync.reload();
    done();
}
function styles() {
    return gulp.src(['src/scss/**/*.+(scss|sass)', '!src/scss/libs.+(scss|sass)'])
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))//' compressed ' for minify
        .pipe(autoprefixer('last 3 versions'))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.stream());
}
function cssLibs() {
    return gulp.src('src/scss/libs.+(scss|sass)')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer('last 3 versions'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.stream());
}
function jsScripts(done) {
    //https://www.youtube.com/watch?v=ax0ykSVPufs
    return browserify({
            entries: ['src/newjs/app.js']
        })
        .transform( babelify, { presets: [ '@babel/preset-env' ] } )
        .bundle()
        .pipe(source('app.js')) // ./app.js
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.stream());
        done();
}
function jsLibs(done) {
    return gulp.src(jsLibsSources)
        .pipe(concat(jsLibsName))
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.stream());
        done();
}
function watch() {
    browserSync.init({
        server: {
            baseDir: './src/'
        },
        port: 3000,
        notify: false,
        tunnel: false
    })
    gulp.watch('src/scss/**/*.+(scss|sass)', gulp.parallel([styles, cssLibs]));
    //gulp.watch('src/js/**/*.js').on('change', browserSync.reload);
    gulp.watch('src/newjs/**/*.js', gulp.series([jsLibs, jsScripts, BSreload]))
    gulp.watch('src/*.html').on('change', browserSync.reload);
}
async function cleanDist() {
    return del.sync('dist');
}
function buildCss() {
    return gulp.src('src/css/*.css', '!src/css/libs.min.css')
        .pipe(gulp.dest('dist/css'));
}
function buildCssLibs() {
    return gulp.src('src/css/libs.min.css')
        .pipe(cleanCss({compatibility: 'ie9'}))
        .pipe(gulp.dest('dist/css'));
}
function buildFonts() {
    return gulp.src('src/fonts/**/*.+(ttf|eot|svg|woff|woff2)')
        .pipe(gulp.dest('dist/fonts'));
}
function buildImages() {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img'));
}
function buildJs() {
    return gulp.src(['src/js/*.js', '!src/js/libs.min.js'])
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
}
function buildJsLibs() {
    return gulp.src('src/js/libs.min.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
}
function buildLibs() {
    return gulp.src('src/libs/**/*')
        .pipe(gulp.dest('dist/libs'));
}
function buildHtml() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
}
gulp.task('clear', () => cache.clearAll());
gulp.task('default', gulp.series([gulp.parallel([jsScripts, jsLibs]), watch]));
gulp.task('build', gulp.series([cleanDist, gulp.series(
    [buildCss, buildCssLibs, buildFonts, buildImages, buildJs, buildJsLibs, buildLibs, buildHtml])
]));

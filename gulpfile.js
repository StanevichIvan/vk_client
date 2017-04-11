'use strict';
console.time('Loading plugins');
// Load plugins
const gulp = require('gulp'),
    // sass = require('gulp-ruby-sass'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    buffer = require('vinyl-buffer'),
    merge = require('merge-stream'),
    spritesmith = require('gulp.spritesmith'),
    htmlmin = require('gulp-htmlmin'),
    fileinclude = require('gulp-file-include'),
    babel = require('gulp-babel');

//html
gulp.task('minify', function () {
    return gulp.src('src/*.html')
    // .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('web'));
});

// Styles
gulp.task('styles', function () {
    return gulp.src('src/styles/app.sass')
        .pipe(sass().on('error', sass.logError))
        // .pipe(rename({suffix: '.min'}))
        //.pipe(minifycss())
        .pipe(gulp.dest('web/css'));
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src('src/scripts/**/*.js')
        .pipe(gulp.dest('web/js/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('web/js/'));
});

// Images
gulp.task('images', function () {
    return gulp.src('src/images/**/*.*')
    // .pipe(imagemin())
        .pipe(gulp.dest('web/images/'));
});

// Sprite Image
gulp.task('sprite', function () {
    var spriteData = gulp.src('src/sprite/**/*.*')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: '_sprite.scss',
            algorithm: 'binary-tree'
        }));

    var imgStream = spriteData.img.pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('web/css/'));
    var cssStream = spriteData.css.pipe(gulp.dest('src/styles/blocks/'));

    return merge(imgStream, cssStream);
});

// Fonts
gulp.task('fonts', function () {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('web/fonts/'));
});

// Watch
gulp.task('watch', function () {
    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    // Watch image files
    gulp.watch('src/images/**/*', ['images']);
    gulp.watch('src/sprite/*', ['sprite']);
    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);

    // Watch fonts files
    gulp.watch('src/fonts/**/*', ['fonts']);
    gulp.watch('src/*.html', ['minify']);

});

//for include
// gulp.task('fileinclude', function () {
//     gulp.src('src/*.html')
//         .pipe(fileinclude({
//             prefix: '@@',
//             basepath: '@file'
//         }))
//         .pipe(gulp.dest('./'));
// });

// Default
gulp.task('default', ['scripts', 'images', 'sprite', 'styles', 'fonts', 'watch', 'minify']);
gulp.task('build', ['scripts', 'images', 'sprite', 'styles', 'fonts', 'minify']);
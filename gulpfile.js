var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var ts = require('gulp-typescript');
var path = require('path')
var process = require('process')
var modifyFile = require('gulp-modify-file')
var filter = require('gulp-filter')
const del = require("del");

var tsProject = ts.createProject('tsconfig.json')

const pathMapping = {
    "@model/(.*)": "model/$1",
    "@utils/(.*)": "utils/$1"
}
const projectSrcDir = path.join(process.cwd(), tsProject.config.compilerOptions.baseUrl)

var importRegex = /(?<=from)\s+"([^"]+)";?/ig
var requireRegex = /(?<=require)\s*\("([^"]+)"\);?/ig

gulp.task('clean', () => del(['build', 'dist']))

gulp.task('compile-ts', () => tsProject.src().pipe(tsProject())
    .js
    .pipe(filter(['**', '!**/*.spec.js']))
    .pipe(modifyFile((content, filePath, file) => {
        let match
        while (match = requireRegex.exec(content)) {
            const importPath = match[1]
            if (!importPath.startsWith('@')) {
                continue
            }
            const translatedPath = Object.entries(pathMapping).map(([regex, pathTemplate]) => {
                var pathMappingMatch = new RegExp(regex).exec(importPath)
                if (!pathMappingMatch) {
                    return null
                }
                return pathTemplate.replace('$1', pathMappingMatch[1])
            }).find(it => it)
            if (translatedPath) {
                const absolutePath = path.join(projectSrcDir, translatedPath)
                const relativePath = path.relative(path.dirname(filePath), absolutePath)
                content = content.replace(importPath, relativePath)
            }
        }
        return content
    }))
    .pipe(gulp.dest("build"))
)


gulp.task('browserify', function () {
    return browserify({
        basedir: ".",
        debug: true,
        entries: ["build/main.js"],
        cache: {},
        packageCache: {}
    })
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest("dist"));
})

gulp.task(
    "default",
    gulp.series(
        'clean',
        'compile-ts',
        'browserify'
    )
);

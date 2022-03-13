var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var ts = require('gulp-typescript');
var fs = require('fs')
var path = require('path')
var process = require('process')
var modifyFile = require('gulp-modify-file')

var tsProject = ts.createProject('tsconfig.json')

const pathMapping = {
    "@model/(.*)": "model/$1",
    "@utils/(.*)": "utils/$1"
}
const projectSrcDir = path.join(process.cwd(), tsProject.config.compilerOptions.baseUrl)

var importRegex = /(?<=from)\s+"([^"]+)";?/ig
var requireRegex = /(?<=require)\s*\("([^"]+)"\);?/ig

gulp.task(
    "default",
    gulp.series(
        () => tsProject.src().pipe(tsProject())
            .js
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
            .pipe(gulp.dest("build")),
        function () {
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
        }
    )
);

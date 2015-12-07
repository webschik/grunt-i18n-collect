var _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerMultiTask('i18nCollect', 'Collect i18n data', function () {
        var options = this.options({
            locales: [],
            method: ''
        });

        var methodName = options.method;

        if (!methodName) {
            grunt.log.warn('Method is not specified.');
            return false;
        }

        this.files.forEach(function (f) {
            var values = {};
            var dest = f.dest.replace(/\/$/, '') + '/';

            f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).forEach(function (filepath) {
                var src;
                var res;
                var quotesPattern = '[\'"]';
                var pattern = new RegExp(methodName + '\\(\\s*' + quotesPattern + '([^)]+)' + quotesPattern + '\\s*\\)', 'g');

                try {
                    src = grunt.file.read(filepath);
                } catch (e) {}

                res = src && pattern.exec(src);
                while (res) {
                    var parts = res[1].trim().split('.');
                    var len = parts.length;
                    var root = values;
                    parts.some(function (part, i) {
                        if (/^[\$\{]{2}/.test(part)) {
                            return true;
                        }

                        if (i === len - 1) {
                            root[part] = '';
                        } else {
                            root = root[part] = root[part] || {};
                        }

                        return false;
                    });

                    res = pattern.exec(src);
                }
            });

            var banner = '';
            var footer = '\nexport default {\n';
            options.locales.forEach(function (locale) {
                var path = dest + locale + '.js';
                var src;

                try {
                    src = grunt.file.read(path);
                } catch (e) {}

                if (src) {
                    src = src.replace(/^[^\{]+/, '').replace(/[^\}]+$/, '');
                }
                src = src || '{}';

                var data = eval('(' + src + ')');
                data = _.merge({}, values, data);
                grunt.file.write(path, 'export default ' +
                    JSON.stringify(data)
                        .replace(/\{/g, '{\n')
                        .replace(/",/g, '",\n')
                        .replace(/,"/g, ',\n"')
                        .replace(/}/g, '\n}') +
                    ';');
                banner += 'import ' + locale + ' from \'./' + locale + '\';\n';
                footer += locale + ':' + locale + ',';
            });

            footer = footer.replace(/,$/, '') + '};';
            grunt.file.write(dest + 'export.js', banner + footer);
        });
    });
};

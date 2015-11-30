# grunt-i18n-collect
Collect i18n keys from sources

##Installation
````js
module.exports = function (grunt) {
    grunt.initConfig({
        i18nCollect: {
            options: {
                locales: ['en', 'ru', 'uk'],
                method: 'translate'
            },
            app: {
                files: [
                    {
                        src: [
                            'src/**/*.js'
                        ],
                        dest: 'src/i18n'
                    }
                ]
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-i18n-collect');

    //... your Grunt tasks
};
````

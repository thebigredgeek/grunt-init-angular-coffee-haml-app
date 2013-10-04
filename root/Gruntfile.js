module.exports = function(grunt){
    var pkg = require('./package.json'), //package file
        i, //iterative member
        jslink = require(__dirname+'/linker/js.json').link,
        csslink = require(__dirname+"/linker/css.json").link,
        hamlcompile = require(__dirname+"/compiler/haml.json").compile;

    csslink.push("src/css/**/*.css");

    grunt.initConfig({
        "pkg": grunt.file.readJSON('package.json'),
        "bump":{
            "options":{
                "files":[
                    "package.json",
                    "bower.json"
                ],
                "updateConfigs": ["pkg"],
                "commit": true,
                "commitMessage": "Release v%VERSION%",
                "commitFiles": ["-a"],
                "createTag": true,
                "tagName": "v%VERSION%",
                "tagMessage": "Version %VERSION%",
                "push": true,
                "pushTo": "origin"
            }
        },
        "coffee":{
            "dist":{
                "options":{
                    "bare":true
                },
                "files":{
                    "process/app.js":[
                        "src/coffee/{%= sterileName %}.coffee",
                        "src/coffee/**/!({%= sterileName %}).coffee"
                    ]
                }
            }
        },
        "karma":{
            "pre":{
                "configFile": "karma.pre.js",
                "autowatch": false
            },
            "post":{
                "configFile": "karma.post.js",
                "autowatch": false
            }
        },
        "express":{
            "server":{
                "options":{
                    "script":"server.js"
                }
            }
        },
        "concurrent":{
            "environment":{
                "tasks":["watch","express"],
                "options":{
                    "logConcurrentOutput":true
                }
            }
        },
        "strip":{
            "dist":{
                "src":"process/app.js",
                "options":{
                    "inline":true,
                    "nodes":[
                        "console.log",
                        "console.warn",
                        "debugger"
                    ]
                }
            }
        },
        "cssmin":{
            "options":{
                "banner": "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('dd/mm/yyyy') %> */",
                "report":"gzip"
            },
            "dist":{
                "files":{
                    "dist/app.css":csslink
                }
            }
        },
        "plato":{
            "report":{
                "options":{
                    "jshint":false
                },
                "files":{
                    "analytics/complexity":["process/app.js"]
                }
            }
        },
        "clean":{
            "dist":["dist"],
            "process":["process"]
        },
        "watch":{
            "files":[
                "README.md",
                "src/**/*.*",
                "test/**/*.spec.js"
            ],
            "tasks":["build"],
            "options":{
                "livereload":true,
                "atBegin":true
            }
        },
        "concat":{
            "options":{
                "stripBanners":true,
                "banner": "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('dd/mm/yyyy') %> */",
                "process":true

            },
            "vendor":{
                "src": jslink,
                "dest":"dist/vendor.js"
            }
        },
        "ngmin":{
            "dist":{
                "src":"process/app.js",
                "dest":"process/app.js"
            }
        },
        "ngtemplates":{
            "{%= sterileName %}":{
                "cwd": "process/html/",
                "src": ["**/!(index).html"],
                "dest": "process/templates.js",
                "options":{
                    "htmlmin":{
                        "collapseWhitespace":true
                    }
                }
            }
        },
        "uglify":{
            "options":{
                "mangle":false,
                "report":"gzip",
                "wrap":true,
                "compress":{
                    "dead_code":true,
                    "drop_debugger":true,
                    "sequences":true,
                    "properties":true,
                    "comparisons":true,
                    "evaluate":true,
                    "booleans":true,
                    "loops":true,
                    "unused":true,
                    "if_return":true,
                    "join_vars":true,
                    "cascade":true,
                    "warnings":true
                }
            },
            "app":{
                "options":{
                    "sourceMap":"dist/app.map",
                    "sourceMappingURL":"app.map",
                    "report":"gzip",
                    "banner": "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */"
                },
                "files":{
                    "dist/app.js":[
                        "process/app.js",
                        "process/templates.js"
                    ]
                }
            }
        },
        "haml":{
            "dist":{
                "files":hamlcompile
            }
        },
        "copy":{
            "maps":{
                "files":[
                    {
                        "expand":true,
                        "flatten": true,
                        "src":[
                            "process/html/index.html",
                            "vendor/managed/**/*.map"
                        ],
                        "dest":"dist/",
                        "filter":"isFile"
                    }
                ]
            }
        }
    });

    for(i in pkg.devDependencies){ //iterate through the development dependencies
        if(pkg.devDependencies.hasOwnProperty(i)){ //avoid iteration over inherited object members
            if(i.substr(0,6) == 'grunt-'){ //only load development dependencies that being with "grunt-""
                grunt.loadNpmTasks(i); //load all grunt tasks
            }
        }
    }
    grunt.registerTask('default',["concurrent"]);

    grunt.registerTask('build',['coffee','karma:pre','haml','cssmin','copy','concat','strip','ngtemplates','uglify','karma:post','plato','clean:process']);
    grunt.registerTask('dist',['build','bump']);
};

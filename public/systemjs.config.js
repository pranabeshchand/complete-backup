/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
    // map tells the System loader where to look for things
    var map = {
        'app':                        'dist', // 'dist',
        '@angular':                   'node_modules/@angular',
        'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
        'rxjs':                       'node_modules/rxjs',
        'angular2-jwt':               'node_modules/angular2-jwt',
        'angular2-datatable': 'node_modules/angular2-datatable',
        'lodash': 'node_modules/lodash',
        'stringjs': 'node_modules/string/dist',
        'jsep': 'node_modules/jsep/build',
        'googledriveapi': 'app/js',
        'boxsdk': 'node_modules/box-node-sdk/lib',
        'json2csv': 'node_modules/json2csv/dist',
        'ngx-popover': 'node_modules/ngx-popover',
        'CircularJson' : 'node_modules/circular-json/build',
        'ng2-search-filter': 'node_modules/ng2-search-filter',
        'moment': 'node_modules/moment',
        'timezone': 'node_modules/moment-timezone/builds'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app':                        { main: 'main.js',  defaultExtension: 'js' },
        'rxjs':                       { main: 'Observable.js' ,defaultExtension: 'js' },
        'angular2-in-memory-web-api': { main: 'index.js', defaultExtension: 'js' },
        'angular2-jwt':               { main: 'angular2-jwt.js', defaultExtension: 'js'},

        'angular2-datatable': {main: 'index.js', defaultExtension: 'js'},
        'lodash': { main: 'lodash.js',defaultExtension: 'js'},
        'stringjs' : {main: 'string.js', defaultExtension: 'js'},
        'jsep': { main: 'jsep.js',defaultExtension: 'js'},
        'googledriveapi': { main: 'googledriveapi.js',defaultExtension: 'js'},
        'boxsdk': { main: 'box-node-sdk.js',defaultExtension: 'js'},
        'json2csv': { main: 'json2csv.js',defaultExtension: 'js'},
        "ngx-popover": { "main": "index.js", "defaultExtension": "js" },
        "CircularJson": {"main": "circular-json.js", "defaultExtension": "js"},
        'ng2-search-filter': { main: 'dist/index.js' },
        'moment': {main: 'moment',"defaultExtension": "js"},
        'timezone': {main: 'moment-timezone-with-data',"defaultExtension": "js"}

    };
    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'forms',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router',
        'router-deprecated',
        'upgrade'

    ];
    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/'+pkgName] = { main: 'bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
    }
    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);
    var config = {
        map: map,
        packages: packages,
        meta: {
            '*.css': { loader: 'css' }
        }

    };
    System.config(config);
})(this);
var //url = require('url'),
        fs = require('fs'),
        mkdirp = require('mkdirp'),
        path = require('path'),
        extend = require('extend');

module.exports = function(options) {

    'use strict';

    options = extend({
        /* Function(req) or regular expression to match the url */
        match: false,
        memorize: true,
        recall: false,
        storageDir: 'offline',
        normalize: /^.+?\/\/.+?(\/.*$)/
    }, options);

    if (!options.storageDir) throw 'options.storageDir is not defined!';

    return function(req, res, next) {
        // console.log(req);
        if ('GET' != req.method && 'HEAD' != req.method) return next();

        if (typeof options.match === 'function') {
            if (!options.match(req)) {
                next();
                return;
            }
        } else if (options.match) {
            if (!req.url.match(options.match)) {
                next();
                return;
            }
        }

        var urlPath = req.url;
        if (typeof options.normalize === 'function') {
            urlPath = options.normalize(urlPath);
        } else if (options.normalize) {
            urlPath = urlPath.match(options.normalize);
            urlPath = urlPath && urlPath[1] ? urlPath[1] : req.url;
        }

        urlPath = escape(urlPath);
        if (urlPath[0] === '/') urlPath = urlPath.substr(1);
        if (urlPath === '') urlPath = 'index';

        var storageFile = options.storageDir + '/' + urlPath;

        if (options.recall) {
            // try to serve offline file
            if (fs.existsSync(storageFile)) {
                fs.createReadStream(storageFile).pipe(res);

                return;
            }
        }

        if (options.memorize) {
            // memorize the response
            var _write = res.write,
                _end = res.end,
                file = null,
                partFile = storageFile + '.part';

            var memorize = function(data, enc) {
                if (!file) {
                    // lazy initialize file on first write
                    mkdirp.sync(path.dirname(partFile));
                    file = fs.createWriteStream(partFile, {flags: 'w'});
                }
                file.write(data, enc);
            }  
            res.write = function(data, enc, cb) {
                memorize(data, enc);
                return _write.call(this, data, enc, cb);
            }
            res.end = function(data, enc, cb) {
                if (data) memorize(data, enc);
                if (file) {
                    file.end();
                    try {
                        fs.renameSync(partFile, storageFile);
                    } catch (e) {}
                }
                return _end.call(this, data, enc, cb);
            }
        }

        next();
    };
}

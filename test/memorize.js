var memorize = require('../'), 
    connect = require('connect'),
    rimraf = require('rimraf'),
    fs = require('fs'),
    should = require('chai').should()
    ;

describe('memorize', function() {
    var app, 
        dir = 'test-offline';

    beforeEach(function(done) {
        rimraf(dir, done);
    })

    function createServer(memopts, match) {
        app = connect();
        memopts.storageDir = dir;
        app.use(memorize(memopts))
            .use(function(req, res, next) {
                if (match && !req.url.match(match)) return next();
                res.end('Hello '+ req.url);
            })
        return app;
    }

    it('should memorize response', function(done) {
        createServer({memorize: true});
        app.request()
            .get('/world.html')
            .expect('Hello /world.html', function() {
                fs.existsSync(dir + '/world.html').should.equal(true);
                fs.readFileSync(dir + '/world.html', 'utf-8').should.equal('Hello /world.html');
                done();
            });
    })

    it('should skip response', function(done) {
        createServer({memorize: true, match: /^\/world/});
        app.request()
            .get('/world.html')
            .expect('Hello /world.html', function() {
                fs.existsSync(dir + '/world.html').should.equal(true);
                app.request()
                    .get('/stranger.html')
                    .expect('Hello /stranger.html', function() {
                        fs.existsSync(dir + '/stranger.html').should.equal(false);
                        done();
                    });
            });
    })

    it('should normalize url', function(done) {
        createServer({memorize: true, normalize: /^(.+)\.html?$/});
        app.request()
            .get('/world.html')
            .expect('Hello /world.html', function() {
                fs.readFileSync(dir + '/world', 'utf-8').should.equal('Hello /world.html');
                done();
            });
    })

    it('should recall url', function(done) {
        createServer({recall: true});
        fs.mkdirSync(dir);
        fs.writeFileSync(dir + '/world.html', 'Something to recall');
        app.request()
            .get('/world.html')
            .expect('Something to recall', done);
    })

    it('should memorize complex data', function(done) {
        createServer({memorize: true}, /none/);
        app.use(function(req, res) {
            res.writeHead(200, {'Content-type': 'text/plain'})
            res.write('Hello');    
            res.write(' ');    
            res.write('world!');    
            res.end();
        });

        app.request()
            .get('/index.html')
            .expect('Hello world!', function() {
                fs.readFileSync(dir + '/index.html', 'utf-8').should.equal('Hello world!');
                done();
            });
    }) 

    it('should skip head', function(done) {
        createServer({memorize: true});
        app.request()
            .head('/world.html')
            .expect('', function() {
                fs.existsSync(dir + '/world.html').should.equal(false);
                done();
            });
    })    

    it('should handle buffer', function(done) {
        createServer({memorize: true}, /none/);
        app.use(function(req, res) {
                res.write(new Buffer([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
                res.write(new Buffer([0x20, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21]));
                res.end();
            });

        app.request()
            .get('/buffer')
            .expect(200, function() {
                fs.readFileSync(dir + '/buffer', 'utf-8').should.equal('Hello Hello!');
                done();
            });
    })     

    it('should skip 404 response without response code', function(done) {
        createServer({memorize: true}, /none/);
        app.request()
            .get('/404-without')
            .expect(404, function() {
                fs.existsSync(dir + '/404-without').should.equal(false);
                done();
            });
    })  

    it('should skip 404 response with response code', function(done) {
        createServer({memorize: true}, /none/);
        app.use(function(req, res) {
                res.statusCode = 404;
                res.end('sorry!');
            });

        app.request()
            .get('/404-code')
            .expect(404, function() {
                fs.existsSync(dir + '/404-code').should.equal(false);
                done();
            });
    })  

    it('should skip 404 response with write head', function(done) {
        createServer({memorize: true}, /none/);
        app.use(function(req, res) {
                res.writeHead(404);
                res.end('sorry!');
            });

        app.request()
            .get('/404-head')
            .expect(404, function() {
                fs.existsSync(dir + '/404-head').should.equal(false);
                done();
            });
    })  

})

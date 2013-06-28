var memorize = require('../'), 
	connect = require('connect')
	;

describe('memorize', function() {
	var app;
	function createServer(memopts) {
		app = connect();
		app.use(memorize(memopts))
			.use(function(req, res) {
				res.end('Hello '+ req.url +'!');
			});
		return app;
	}

	it('should memorize response', function(done) {
		createServer({memorize: true});
		console.log('aaaa');
		app.request()
			.get('http://127.0.0.1:8765/world.html')
			.expect('Hello world!', function() {

				done();
			});
	})

})

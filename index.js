
var through = require('through2')
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-prefixer';

function parseManifest(file){
	var matches = file.contents.toString().match(/(.*):(.*)/g);
	var manifestObj = {};
	matches.forEach(function(item){
		var arr = item.split(':');
		manifestObj[arr[0].trim()] = arr[1].trim();
	});
	return manifestObj;
}

function build(commands, options) {
	var stream = through.obj(function(file, unused, done) {
		if (file.isStream()) {
	      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
	      return cb();
	    }

		if(!file.manifest){
			
    		file.manifest = parseManifest(file);
		}
		
    	this.push(file);
		done();
	});
	stream.resume();

	return stream;
}



// timodule.task = function (commands, options) {
//   return function () {
//     var stream = timodule(commands, options)

//     stream.write(new gutil.File())
//     stream.end()

//     return stream
//   }
// }

module.exports = {
	build: build
}
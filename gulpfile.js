// gulp..
var gulp = require('gulp');
var through = require('through2')
var shell = require('gulp-shell');
var gutil = require('gulp-util'), log = gutil.log;
var jeditor = require("gulp-json-editor");

// node
var fs = require("fs");
var exec = require('child_process').exec;
var util = require('util');
var os = require('os');

// npm
var del = require('del');
var path = require("path");
var UUID = require('uuid-js');
var sh = require('execSync');

// config : auto select titanium_sdk_dir
var os_map = { 'win32': 'win32', 'darwin': 'osx', 'linux': 'linux' };
var os_name = os_map[os.platform()];
var sdkLocation = sh.exec('ti config sdk.defaultInstallLocation').stdout.replace('\n','').replace(' ','\\ ');
var selectedSdk = sh.exec('ti config sdk.selected').stdout.replace('\n','');
var config = {
	IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
	ANDROID_EXAMPLE_BUILD_COMMAND : 'ti build -p android',
	TITANIUM_SDK_DIR : path.join(sdkLocation,'mobilesdk',os_name,selectedSdk),
	EXAMPLE_PROJECT_NAME : 'example_test_build'
}

// globals
var example_project_path = path.join(__dirname,config.EXAMPLE_PROJECT_NAME);
var manifests = {};

// gulp plugin
function timanifest2json(options) {
	var options = options || {};
	var PLUGIN_NAME = 'toJSON'
	var stream = through.obj(function(file, enc, cb) {
		var self = this;
		if (file.isStream()) {
	      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
	      return cb();
	    }

	    if(file.isBuffer()){
			var matches = String(file.contents).match(/(.*):(.*)/g);
			var manifestObj = {};
			matches.forEach(function(item){
				var arr = item.split(':');
				manifestObj[arr[0].trim()] = arr[1].trim();
			});
			manifestObj.cwd = file.base; //add path of each module project for running command
			file.contents = new Buffer(JSON.stringify(manifestObj));
			log(' - '+manifestObj.platform + ' manifest parsed');
	    }
		this.push(file);
		cb();
	});
	return stream;
}

gulp.task('clean', function(cb) {
	var delList = [];
	delList.push(example_project_path);
    del(delList, cb);
});

gulp.task('default', function(cb) {
	cb();
});

gulp.task('init',['clean'],function(){
	return gulp.src("./*/manifest")
		.pipe(timanifest2json())
		.pipe(jeditor(function(json){
			if(json.platform){
				manifests[json.platform] = json; // save for other tasks..
			}
			return json
		}));
});

gulp.task('ios:build',['init'], shell.task([ 'python build.py'],{cwd:'iphone'}));
gulp.task('android:build', ['init'], shell.task(['ant dist'],{cwd:'android'}));

function createTemplateProject(manifest,cb){
	var child = exec(
		[ config.TITANIUM_SDK_DIR+'/project.py',config.EXAMPLE_PROJECT_NAME, manifest.moduleid, __dirname, manifest.platform ].join(' ')
		, function (error) {
	    	// process.stdin.unpipe(child.stdin)
	    	// process.stdin.pause()
	    	
	    	var moduleTag = util.format('\t<module platform="%s">%s</module>\n\t',manifest.platform, manifest.moduleid);

			var target_tiapp = fs.readFileSync(path.join(example_project_path,"tiapp.xml"),'utf8');
			var write_tiapp = target_tiapp
				.replace('</guid>', UUID.create().toString()+'</guid>')
				.replace('</modules>', moduleTag + '</modules>\n')
				.replace('</ti:app>',	'\t<deployment-targets>\n'+
							'\t\t<target device="android">true</target>\n'+
							'\t\t<target device="ipad">true</target>\n'+
							'\t\t<target device="iphone">true</target>\n'+
						'\t</deployment-targets>\n</ti:app>');
			
			fs.writeFileSync(path.join(example_project_path,"tiapp.xml"), write_tiapp);
			
			var distPath = path.join(__dirname,manifest.platform);
			if(manifest.platform==='android'){
				distPath = path.join(distPath,'dist');
			}

			var copyCommand = util.format('cp %s/%s-%s-%s.zip %s', distPath, manifest.moduleid.toLowerCase(), manifest.platform, manifest.version, example_project_path);
			log(copyCommand);
			exec(copyCommand,function(){
				exec('cp -rf example/* '+example_project_path+'/Resources',function(){
					cb();
				});
			});
		}
	);
}

gulp.task('ready:iosProject',['init','ios:build'],function(cb){
	createTemplateProject(manifests.iphone,cb);
});
gulp.task('ready:androidProject',['init','android:build'],function(cb){
	createTemplateProject(manifests.android,cb);
});

gulp.task('ios',['ready:iosProject'],shell.task([
	config.IOS_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path}));

gulp.task('android',['ready:androidProject'],shell.task([
	config.ANDROID_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path}));
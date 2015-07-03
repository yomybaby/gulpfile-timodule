// gulp..
var gulp = require('gulp');
var through = require('through2')
var shell = require('gulp-shell');
var gutil = require('gulp-util'), log = gutil.log;
var jeditor = require("gulp-json-editor");

// node
var fs = require("fs");
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var util = require('util');
var os = require('os');

// npm
var del = require('del');
var path = require("path");
var UUID = require('uuid-js');

// config : auto select titanium_sdk_dir
var os_map = { 'win32': 'win32', 'darwin': 'osx', 'linux': 'linux' };
var os_name = os_map[os.platform()];
var sdkLocation = execSync('ti config sdk.defaultInstallLocation').toString().replace('\n','').replace(' ','\\ ');
var selectedSdk = execSync('ti config sdk.selected').toString().replace('\n','');
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
	//delList.push(example_project_path);
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
	var mkdirp = require('mkdirp');
	mkdirp.sync(example_project_path+'/Resources');

	// tiappStr base on TiSDK 3.4.1.GA default tiapp.xml
	var tiapp;
	var tiappStr = '<?xml version="1.0" encoding="UTF-8"?> <ti:app xmlns:ti="http://ti.appcelerator.org"> <id></id> <name></name> <version>1.0</version> <publisher>not specified</publisher> <url>http://yoururl.com</url> <description></description> <copyright>not specified</copyright> <icon>appicon.png</icon> <fullscreen>false</fullscreen> <navbar-hidden>false</navbar-hidden> <analytics>true</analytics> <guid></guid> <property name="ti.ui.defaultunit" type="string">dp</property> <ios> <plist> <dict> <key>UISupportedInterfaceOrientations~iphone</key> <array> <string>UIInterfaceOrientationPortrait</string> </array> <key>UISupportedInterfaceOrientations~ipad</key> <array> <string>UIInterfaceOrientationPortrait</string> <string>UIInterfaceOrientationPortraitUpsideDown</string> <string>UIInterfaceOrientationLandscapeLeft</string> <string>UIInterfaceOrientationLandscapeRight</string> </array> <key>UIRequiresPersistentWiFi</key> <false/> <key>UIPrerenderedIcon</key> <false/> <key>UIStatusBarHidden</key> <false/> <key>UIStatusBarStyle</key> <string>UIStatusBarStyleDefault</string> </dict> </plist> </ios> <android xmlns:android="http://schemas.android.com/apk/res/android"> </android> <mobileweb> <precache> </precache> <splash> <enabled>true</enabled> <inline-css-images>true</inline-css-images> </splash> <theme>default</theme> </mobileweb> <modules> </modules> <deployment-targets> <target device="android">true</target> <target device="blackberry">true</target> <target device="ipad">true</target> <target device="iphone">true</target> <target device="mobileweb">true</target> </deployment-targets> <sdk-version>3.4.1.GA</sdk-version> </ti:app>';
	if(fs.existsSync(path.join(example_project_path,"tiapp.xml"))){
		tiapp = require('tiapp.xml').load(path.join(example_project_path,"tiapp.xml"));
	}else{
		tiapp = require('tiapp.xml').parse(tiappStr);
		tiapp.guid = UUID.create().toString();
		tiapp.id = manifest.moduleid;
		tiapp.name = manifest.moduleid;
	}
	tiapp.setModule(manifest.moduleid, manifest.version, manifest.platform);
	// tiapp.sdkVersion = 'myVersion';
	tiapp.write(path.join(example_project_path,"tiapp.xml"));
	
	var distPath = path.join(__dirname,manifest.platform);
	if(manifest.platform==='android'){
		distPath = path.join(distPath,'dist');
	}

	var copyCommand = util.format('cp %s/%s-%s-%s.zip %s', distPath, manifest.moduleid.toLowerCase(), manifest.platform, manifest.version, example_project_path);
	exec(copyCommand,function(){
		exec('cp -rf example/* '+example_project_path+'/Resources',function(){
			cb();
		});
	});
}

gulp.task('ready:iosProject',['init','ios:build'],function(cb){
	createTemplateProject(manifests.iphone,cb);
});
gulp.task('ready:androidProject',['init','android:build'],function(cb){
	createTemplateProject(manifests.android,cb);
});

gulp.task('ios',['init','ready:iosProject'],shell.task([
	config.IOS_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path}));

gulp.task('android',['init','ready:androidProject'],shell.task([
	config.ANDROID_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path}));

//modules
var gulp = require('gulp');
var through = require('through2')
var fs = require("fs");
var del = require('del');
var mkdirp = require('mkdirp');
var shell = require('gulp-shell');
var util = require('util');
var gutil = require('gulp-util'), log = gutil.log;
var path = require("path");
var UUID = require('uuid-js');
var rename = require('gulp-rename');
// var runSequence = require('run-sequence');

//gulp pugins
var timodule = require('./gulp-timodule');

//for toJSON pugin
var PluginError = gutil.PluginError;


// 1. node에서 manifest 파일 파싱 모듈 찾기 (ti cli 뒤져보자..)
// -2. project를 간단히 생성해보자 (template이용해서 builder.py 에서 했던거와 비슷하게)
// 2-1. example의 app.js등 필요한 파일을 복사한다 (build.py참고)
// 3. gittio를 이용해서 해당 zip 프로젝트에 설치한다. (gitto를 이용할 경우 deployment-targets를 tiapp.xml 에 추가해야한다.)
// 4. ti cli 이용해서 생성한 project를 build(실행)한다.


var config = {
	// IOS_DIR : 'iphone',
	IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
	// ANDROID_DIR : 'android',
	ANDROID_EXAMPLE_BUILD_COMMAND : 'ti build -p android',
	TITANIUM_SDK_DIR : '~/Library/Application\\ Support/Titanium/mobilesdk/osx/3.3.0.GA'
}

//ios folder와 android폴더 확인

var moduleid  = "com.example.test",
	version = "1.0.0",
	platform = "iphone",
	name = 'test';

var example_project_path = path.join(__dirname,'example_build',name);
var manifests = ['iphone/manifest','android/manifest'];

function timanifest2json(options) {
	var options = options || {};
	var PLUGIN_NAME = 'toJSON'
	var stream = through.obj(function(file, enc, cb) {
		var self = this;
		if (file.isStream()) {
	      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
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
			log(JSON.stringify(file));
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
	delList.push('./*/manifest.json')
    del(delList, cb);
});

gulp.task('default', ['manifest2json'],function(cb) {
	//return //gulp.src("./*/manifest")
	cb();

});

gulp.task('manifest2json',['clean'],function(){
	//json으로 manifest를 만들고
	return gulp.src("./*/manifest")
		.pipe(timanifest2json())
		.pipe(rename(function (path) {
	        path.extname = ".json"
	    }))
		.pipe(gulp.dest('./'));
});

gulp.task('ios:build',['manifest2json'], shell.task([ 'python build.py'],{cwd:'iphone'}));
gulp.task('android:build', ['manifest2json'], shell.task(['ant dist'],{cwd:'android'}));

gul.task('ready:project',['create:project','ios:build'],function(cb){
	
	util.format('\t<module version="%s">%s</module>\n\t</modules>\n',version, moduleid)

	var target_tiapp = fs.readFileSync(path.join(example_project_path,"tiapp.xml"),'utf8');
	var write_tiapp = target_tiapp
		.replace('</guid>', UUID.create().toString()+'</guid>');
		.replace('</modules>', iosModuleTag + '</modules>');
		.replace('</modules>', androidModuleTag + '</modules>')
	console.log(write_tiapp);
	fs.writeFileSync(path.join(example_project_path,"tiapp.xml"), write_tiapp);
	cb();
});

//manifst.json를  [바탕으로 build하고 project만들고(build도 동시에가능)], project만들면 파일복사하고

// gulp.task('ios:build', shell.task([ 'python build.py'],{cwd:config.IOS_DIR}));

gulp.task('run:project.py', shell.task([
	[ config.TITANIUM_SDK_DIR+'/project.py',name, moduleid, 'example_build', platform ].join(' '),
	'cp -rf example/* example_build/'+name+'/Resources'
],{}));

gulp.task('create:project',['run:project.py'],function(){
	// tiapp.xml 수정
	// guid 변경
	// modules에 추가
	var target_tiapp = fs.readFileSync(path.join(example_project_path,"tiapp.xml"),'utf8');
	var write_tiapp = target_tiapp
		.replace('</guid>', UUID.create().toString()+'</guid>')
		.replace('</modules>', util.format('\t<module version="%s">%s</module>\n\t</modules>\n',version, moduleid));
	console.log(write_tiapp);
	fs.writeFileSync(path.join(example_project_path,"tiapp.xml"), write_tiapp);
});

// gulp.task('ios',['ios:build','create:project'],shell.task([
// 	util.format('cp ../../%s/%s-%s-%s.zip ./',config.IOS_DIR, moduleid.toLowerCase(), 'iphone', version),
// 	config.IOS_EXAMPLE_BUILD_COMMAND
// ],{cwd: example_project_path }));

gulp.task('android',['android:build','create:project'],shell.task([
	util.format('cp ../../%s/dist/%s-%s-%s.zip ./',config.ANDROID_DIR, moduleid.toLowerCase(), 'android', version),
	config.ANDROID_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path }));
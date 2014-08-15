var gulp = require('gulp');
var fs = require("fs");
var del = require('del');
var mkdirp = require('mkdirp');
var shell = require('gulp-shell');
var util = require('util');
var path = require("path");
var UUID = require('uuid-js');
var timodule = require('./gulp-timodule');

// 1. node에서 manifest 파일 파싱 모듈 찾기 (ti cli 뒤져보자..)
// -2. project를 간단히 생성해보자 (template이용해서 builder.py 에서 했던거와 비슷하게)
// 2-1. example의 app.js등 필요한 파일을 복사한다 (build.py참고)
// 3. gittio를 이용해서 해당 zip 프로젝트에 설치한다. (gitto를 이용할 경우 deployment-targets를 tiapp.xml 에 추가해야한다.)
// 4. ti cli 이용해서 생성한 project를 build(실행)한다.


var config = {
	IOS_DIR : 'iphone',
	IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
	ANDROID_DIR : 'android',
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

gulp.task('ios:build', shell.task([
  'python build.py'
],{cwd:config.IOS_DIR}));

gulp.task('ios:build', shell.task([ 'python build.py'],{cwd:config.IOS_DIR}));
gulp.task('android:build', shell.task(['ant dist'],{cwd:config.ANDROID_DIR}));

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

gulp.task('ios',['ios:build','create:project'],shell.task([
	util.format('cp ../../%s/%s-%s-%s.zip ./',config.IOS_DIR, moduleid.toLowerCase(), 'iphone', version),
	config.IOS_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path }));

gulp.task('android',['android:build','create:project'],shell.task([
	util.format('cp ../../%s/dist/%s-%s-%s.zip ./',config.ANDROID_DIR, moduleid.toLowerCase(), 'android', version),
	config.ANDROID_EXAMPLE_BUILD_COMMAND
],{cwd: example_project_path }));
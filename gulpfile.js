var gulp = require('gulp');

var del = require('del');
var mkdirp = require('mkdirp');
var shell = require('gulp-shell');
var util = require('util');

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

var moduleid  = "com.example.test",
	version = "1.0.0",
	platform = "iphone",
	name = 'test';

gulp.task('default', function() {

});


gulp.task('ios:build', shell.task([
  'python build.py'
],{cwd:config.IOS_DIR}));

gulp.task('android:build', shell.task([
  'ant dist'
],{cwd:config.ANDROID_DIR}));

gulp.task('create:example', shell.task([
	[ config.TITANIUM_SDK_DIR+'/project.py',name, moduleid, 'example_build', platform ].join(' ')
	// 'pwd'
],{}));

gulp.task('copy:iosmodule', shell.task([
	util.format('gittio install ../../%s/%s-%s-%s.zip',platform, moduleid.toLowerCase(), platform, version)
],{cwd : 'example_build/'+name }));

gulp.task('example', function() {

});

//console.log(util.format('gittio install ../../%s/%s-%s-%s.zip',platform, moduleid.toLowerCase(), platform, version));
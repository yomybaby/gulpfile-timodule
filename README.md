# gulpfile.js for Titanium Module Project
titanium native module 만들 때 간편하게 build하고 example을 테스트 해볼 수 있도록 해주는 gulpfile 입니다. example 테스트시 titanium build 명령을 지정 할 수 있습니다.

## 시작하기 전에
- [gulp.js](http://gulpjs.com) 가 설치되어 있어야 합니다.
      sudo npm install -g gulp
- osx 및 Ti SDK 3.3.0.GA 및 Alloy 1.4.x 환경에서 만들어졌습니다.

## 시작하기
### 1. 모듈 프로젝트 생성

- Ti 3.3.x 부터는 titanium cli를 통해 module project를 생성할 수 있습니다. 또한 3.3.x부터는 폴더 구조가 바뀌었습니다. 바뀐 프로젝트 구조로 인해 multi platform을 지원하는 모듈을 만들 수 있습니다. (예를 들어 ios및 android용 native pg결제 모듈을 Titanium Native Module 로 만들 때 이름으로 같은 api로 만들기가 가능해집니다. example, documentation, assets 등을 공유합니다.)

        ## iOS Command
        ti create -p ios -t module -d <WORKSPACE_DIR> -n <MODULE_NAME> -u <MODULE_URL> --id <MODULE_ID>
        ## Android Command
        ti create -p android -t module -d <WORKSPACE_DIR> -n <MODULE_NAME> -u <MODULE_URL> --id <MODULE_ID>

- android 및  iphone용으로 둘다 만들 경우 `-p ios,android`로 하면 같이 생성된다.

        ti create -p ios,android -t module -d ~/Documents/Sample_Workspace/ -n testProjectName -u http:// --id com.example.test
      
- 참고 링크
  - [CLI for android module](http://docs.appcelerator.com/titanium/latest/#!/guide/Android_Module_Development_Guide-section-29004945_AndroidModuleDevelopmentGuide-CreatingfromtheTerminal)
  - [CLI for iphone module](http://docs.appcelerator.com/titanium/latest/#!/guide/iOS_Module_Development_Guide-section-29004946_iOSModuleDevelopmentGuide-Step2%3ACreatingyourFirstModule)

### 2. gulpfile.js 및 package.json 복사
1. gulpfile.js 및 package.json을 위에서 생성한 project root 디랙토리(예. ~/Documenst/Sample_Workspace/testProjectName)에 복사한다.
1. project root에서 `[sudo] npm install` 실행

### 4. 준비 끝! gulp task 사용!
- `gulp ios` :
- `gulp ios:build` :
- `gulp android` :
- `gulp android:build` :

## 기타 설정 관련
gulpfile.js 상단에 있는 config를 환경에 맞게 수정하세요. `IOS_EXAMPLE_BUILD_COMMAND`와 `ANDROID_EXAMPLE_BUILD_COMMAND`는 `example/app.js` 프로젝트 실행 명령어 입니다.

    var config = {
      IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
      ANDROID_EXAMPLE_BUILD_COMMAND : 'ti build -p android',
      TITANIUM_SDK_DIR : '~/Library/Application\\ Support/Titanium/mobilesdk/osx/3.3.0.GA',
      EXAMPLE_PROJECT_NAME : 'example_test_build'
    }

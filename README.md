# gulpfile.js for Titanium Module Project
This is a gulfile for Titanium module build and run. You can make a build command as you want. For example, run with tishadow `--appify` flag.

## Why made this file?

1. default titanium module commands depneds on platform. `build.py` for ios and `ant` for android. I want to make it more simple.
2. `titanium.py run` is command for test with `example/app.js`. But it make a titanium project file on `/var/tmp`. It's hard to find and it will delete automatically. This gulpfile make a titanium project using `example/app.js` under project folder(default : `example_test_build`)
3.
## Before Start
- Install [gulp.js](http://gulpjs.com)
      sudo npm install -g gulp
- You should know about titanium module folder structure.
    - Since Release 3.3.0, the CLI creates a module project that contains multiple platforms. Each platform contains its own folder with platform-specific resources and common folders for assets, documentation and example. Prior to Release 3.3.0, none of the previous listed folder are contained in an android folder.
    - Starting with Release 3.3.0, the Titanium CLI generates a module project containing multiple platforms. The module contains platform folders, for example, iphone, that contain platform-specific resources and common folders for assets, documentation and examples. Prior to Release 3.3.0, none of the previous listed folder are contained in an iphone folder.
    - example, documentation, assets be shared.
- This gulpfile tested on OSx. (Not sure works on Windows Platfoms)

## Start
### 1. Create module
- Create titanium module using Titanium CLI.

        ## iOS Command
        ti create -p ios -t module -d <WORKSPACE_DIR> -n <MODULE_NAME> -u <MODULE_URL> --id <MODULE_ID>
        ## Android Command
        ti create -p android -t module -d <WORKSPACE_DIR> -n <MODULE_NAME> -u <MODULE_URL> --id <MODULE_ID>

- If you want to make both with one command, using `-p ios,android`.

        ti create -p ios,android -t module -d ~/Documents/Sample_Workspace/ -n testProjectName -u http:// --id com.example.test

- More read
  - [CLI for android module](http://docs.appcelerator.com/titanium/latest/#!/guide/Android_Module_Development_Guide-section-29004945_AndroidModuleDevelopmentGuide-CreatingfromtheTerminal)
  - [CLI for iphone module](http://docs.appcelerator.com/titanium/latest/#!/guide/iOS_Module_Development_Guide-section-29004946_iOSModuleDevelopmentGuide-Step2%3ACreatingyourFirstModule)

### 2. Copy gulpfile.js and package.json
1. Copy gulpfile.js and package.json of this repository to your module project root folder. (예. ~/Documenst/Sample_Workspace/testProjectName)
1. on Project root folder, run `[sudo] npm install`.

### 4. You're ready! Use gulp task.

command | description
------- | -----------
`gulp ios` | 1) build ios native module 2) make and run titanium project with `example/app.js`
`gulp ios:build` | ios native module build(only make a module zip)
`gulp android` | 1) build android native module 2) make and run titanium project with `example/app.js`
`gulp android:build` | android native module build (only make a module zip `dist/*.zip`)

## Configuration
Edit `config` value on top of `gulpfile.js` source. `IOS_EXAMPLE_BUILD_COMMAND`와 `ANDROID_EXAMPLE_BUILD_COMMAND` are commands for run titanium example project.

    var config = {
      IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
      ANDROID_EXAMPLE_BUILD_COMMAND : 'ti build -p android',
      TITANIUM_SDK_DIR : path.join(sdkLocation,'mobilesdk',os_name,selectedSdk),
      EXAMPLE_PROJECT_NAME : 'example_test_build'
    }



----------

# gulpfile.js for Titanium Module Project
titanium native module 만들 때 간편하게 build하고 example을 테스트 해볼 수 있도록 해주는 gulpfile 입니다. example 테스트시 titanium build 명령을 지정 할 수 있습니다.

## 왜 이걸 만들었나요?

1. titanium에서 기본적으로 제공하는 모듈 제작과 관련된 명령어가 ios(build.py)와 android(ant 이용) 다르기 때문에 명령어를 기억하기 어려워서요. 간단히 하고 싶었습니다.
2. titanium에서 기본적으로 제공하는 실행 명령어를 통해 `example/app.js`가 포함된 테스트 프로젝트가 `/var/tmp` 폴더에 만들어져서 찾기도 어렵고 나중에 지워 집니다. 실제 모듈 개발하면서 tishadow를 이용한다거나 xcode로 디버깅할때 example 프로젝트를 간단히 열기위해 모듈 프로젝트 안의 하위 폴더(`example_test_build`)로 만들고 싶었습니다.

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
- `gulp ios` : ios native module build 후 example/app.js 를 이용해서 프로젝트 생성 및 실행
- `gulp ios:build` : ios native module build(zip파일만 생성)
- `gulp android` : android native module build 후 example/app.js 를 이용해서 프로젝트 생성 및 실행
- `gulp android:build` : android native module build (dist/*.zip파일만 생성)

## 기타 설정 관련
gulpfile.js 상단에 있는 config를 환경에 맞게 수정하세요. `IOS_EXAMPLE_BUILD_COMMAND`와 `ANDROID_EXAMPLE_BUILD_COMMAND`는 `example/app.js` 프로젝트 실행 명령어 입니다.

    var config = {
      IOS_EXAMPLE_BUILD_COMMAND : 'ti build -p ios',
      ANDROID_EXAMPLE_BUILD_COMMAND : 'ti build -p android',
      TITANIUM_SDK_DIR : path.join(sdkLocation,'mobilesdk',os_name,selectedSdk),
      EXAMPLE_PROJECT_NAME : 'example_test_build'
    }

# React Native Colo Loco 😜

Hey! You found an experiment that I'm working on. Fun fun.

This library lets you colocate your native Swift, Kotlin, Objective-C, and Java files with your React Native JavaScript/TypeScript files.

![Colo Loco in action](https://user-images.githubusercontent.com/1479215/141171378-5c57f97a-0bb2-494a-ad96-ffdb529cb665.png)

## Installation

Add this library to your development dependencies:

```
npm install --save-dev react-native-colo-loco
# or
yarn add -D react-native-colo-loco
```

### iOS Installation

For iOS, add this to your Podfile (`ios/Podfile`):

```ruby
require_relative '../node_modules/react-native-colo-loco/scripts/ios.rb'
link_colocated_native_files(app_name: 'MyApp', app_path: "../app")
```

### Android Installation

Create a "package" file for your project in `./android/app/src/main/java/com/myapp/MyAppPackage.java` (but replace `myapp` and `MyApp` with your app's name).

The contents of this file will be this:

```java
// ./android/app/src/main/java/com/myapp/MyAppPackage.java
package com.myapp; // replace myapp with your app’s package name
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// Replace MyApp with your app's name
public class MyAppPackage implements ReactPackage {
   @Override
   public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
       return Collections.emptyList();
   }

   @Override
   public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
      List<NativeModule> modules = new ArrayList<>();

      // Add all react-native-colo-loco modules from ./colocated/ColoLoco.java
      modules.addAll(ColoLoco.colocatedModules(reactContext));

      return modules;
   }
}
```

Open up your `MainApplication.java` file in the same folder and update the following method:

```java
@Override
protected List<ReactPackage> getPackages() {
  @SuppressWarnings("UnnecessaryLocalVariable")
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here, for example:
  // packages.add(new MyReactNativePackage());
  packages.add(new MyAppPackage());
  return packages;
}
```

Open up your `./android/settings.gradle` file and add this near the top (replace `myapp` with your app name):

```groovy
rootProject.name = 'MyApp'

apply from: '../node_modules/react-native-colo-loco/scripts/android.groovy'
linkColocatedNativeFiles([
  appName: rootProject.name,
  appPath: "../app",
  appPackageName: "com.myapp",
  androidPath: "./android/app/src/main/java/com/myapp"
])

// rest of file...
```

Now, when you run `yarn android`, it'll hardlink your `.java` files into a `colocated` folder in your Android project directory and then generate the class `ColoLoco` which will instantiate & register all of them with your project.

## Usage

For native Objective-C and Java modules, place your .m, .h, .swift, and .java files anywhere near your JavaScript/JSX files. They'll be linked in automatically when you run `npx pod-install` or `pod install`, or in Android's case, when you run `yarn android`.

```
ios/
android/
app/
  components/
    MyButton.tsx
    MyButton.h
    MyButton.m
    MyButton.java
```

## Examples

### Objective-C Example

Let's build a small native module.

In a fresh React Native project, make a folder called `app`. Place two files inside of that -- `Jamon.h` and `Jamon.m`.

```tsx
// app/Jamon.h
#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
@interface Jamon : NSObject <RCTBridgeModule>
@end
```

```tsx
// Jamon.m
#import "Jamon.h"

@implementation Jamon

RCT_EXPORT_MODULE();

// Export a method -- `Jamon.hello()`
RCT_EXPORT_METHOD(hello)
{
  // Alerts have to go on the main thread
  dispatch_async(dispatch_get_main_queue(), ^{
    UIAlertView *alert = [[UIAlertView alloc]
      initWithTitle: @"Hello from native!"
      message: @"This is from Jamon.m"
      delegate: self
      cancelButtonTitle: @"Cancel"
      otherButtonTitles: @"Say Hello",
      nil
    ];
    [alert show];
  });
}

@end
```

Modify the `App.js` to import the native module:

```jsx
import { NativeModules } from "react-native";
const { Jamon } = NativeModules;

// Now run it:
Jamon.hello();
```

If you haven't added the module yet, run `npm i --save-dev react-native-colo-loco` and then modify your Podfile (replace `MyApp` with your actual app name):

```ruby
require_relative '../node_modules/react-native-colo-loco/scripts/ios.rb'

link_colocated_native_files(app_name: 'MyApp', app_path: "../app")
```

Run `npx pod-install` in your terminal and then run your project with `yarn ios` (or `yarn react-native run-ios`).

You should see the native alert pop up in your app!

Hint: You can read a lot more about iOS native modules here: [https://reactnative.dev/docs/native-modules-ios](https://reactnative.dev/docs/native-modules-ios)

#### Swift Example

Swift requires a bit more setup, but after that you should be able to drop in `.swift` files and have them work. Unfortunately, as of now, Swift files still require a `.m` file to expose them to React Native, so you'll still be making two files.

To set up Swift in your project (only has to be done once):

First, open your xcworkspace file (in the `./ios` folder) in Xcode.

Click File -> New -> New File in the menu (or hit Cmd+N).

Choose "Swift File" under the `Source` section. Name it something like `EnableSwift` and click Create.

Xcode should prompt you with this prompt:
`Would you like to configure an Objective-C bridging header?`

Click `Create bridging header` (this is key).

Inside that file, add this line:

```objective-c
//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//
#import <React/RCTBridgeModule.h>
```

Save it, and you now have Swift support. You can close Xcode and let your Mac take a breather.

Now, it's just a matter of adding Swift files to your project. Inside the `./app` folder you created in the previous section, add the following `Gant.swift` file:

```swift
// Gant.swift
@objc(Gant)
class Gant : NSObject {
  @objc func hello() {
    // Alerts have to go on the main thread
    DispatchQueue.main.async {
      let alert = UIAlertView(
        title: "Hello from native!",
        message: "This is from Gant.swift",
        delegate: nil,
        cancelButtonTitle: "Cancel",
        otherButtonTitles: "Say Hello"
      )
      alert.show()
    }
  }
}
```

Also add a `Gant.m` file next to it to export it to React Native:

```objective-c
// Gant.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Gant, NSObject)
RCT_EXTERN_METHOD(hello)
@end
```

In your `App.js`, just use it like you did the `Jamon` native module:

```jsx
import { NativeModules } from "react-native";
const { Gant } = NativeModules;

Gant.hello();
```

Don't forget to run `npx pod-install` (or `pod install` from the ios folder) to link up the new native files.

Then run `yarn ios` to recompile. You should see the alert pop up! Yay!

## Android example

Coming soon!

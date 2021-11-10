# React Native Colo Loco 😜

Hey! You found an experiment that I'm working on. Fun fun.

This library lets you colocate your native Swift, Kotlin, Objective-C, and Java files with your React Native JavaScript/TypeScript files.

![Colo Loco in action](https://user-images.githubusercontent.com/1479215/141171825-7dd5afa7-eb75-44ea-b653-04372a47e710.png)

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

Create a file called `Jamon.java` and drop it into your app folder next to your JSX/TSX files.

```java
package com.myapp; // change to your app's package name

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.app.AlertDialog;

public class Jamon extends ReactContextBaseJavaModule {
  Jamon(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "Jamon";
  }

  @ReactMethod
  public void hello() {
    // Display a pop-up alert
    AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
    builder.setMessage("Hi, everybody!")
      .setTitle("Jamon")
      .setPositiveButton("OK", null);
    AlertDialog dialog = builder.create();
    dialog.show();
  }
}
```

Now when you import it and run in Android, you'll see the alert pop up!

```jsx
import { NativeModules } from "react-native";
const { Jamon } = NativeModules;

Jamon.hello();
```

## Native UI Components

Native modules are fun, but even more fun are native UI components.

### Native iOS UI Components

### Native Android UI Components

To create a native Android UI component, you can add a java file anywhere in your JS folder structure, but make sure the class name ends in `*ViewManager`.

Here's an example that downloads and shows a remote image:

```java
// app/components/MyImageViewManager.java
package com.myapp; // change to your app's package name

import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.views.image.ReactImageView;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Handler;
import android.util.Log;
import android.view.View;

import java.net.URL;

public class MyImageViewManager extends SimpleViewManager<ReactImageView> {
    // This is the string we use to identify this view when we call
    // requireNativeComponent("MyImageView") in JS.
    public static final String REACT_CLASS = "MyImageView";

    // We hang onto a reference of our React app context for later use.
    ReactApplicationContext mCallerContext;
    ReactImageView mView;

    // This is the URL of the image we'll show
    private final String logoURL = "https://logos-world.net/wp-content/uploads/2021/10/Meta-facebook-Logo-700x394.png";

    // Constructor -- saves a reference to the React context
    public MyImageViewManager(ReactApplicationContext reactContext) {
        mCallerContext = reactContext;
    }

    // Required method to allow React Native to know what the name of this class is.
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    // This method is where we create our native view.
    @Override
    protected ReactImageView createViewInstance(ThemedReactContext reactContext) {
        // Instantiate a new ReactImageView
        // Fresco is a Facebook library for managing Android images and the memory they use.
        // https://github.com/facebook/fresco
        mView = new ReactImageView(reactContext, Fresco.newDraweeControllerBuilder(), null, mCallerContext);

        // This "handler" allows the `startDownloading` thread to call back to *this* thread.
        // Otherwise crashy crashy!
        final Handler mainThread = new Handler();

        // We'll download the image now and apply it back to this view
        startDownloading(mainThread);

        // Return our view back to React Native.
        return mView;
    }

    // Download our image.
    private void startDownloading(final Handler mainThread) {
        // Create a new background thread to download our image
        new Thread(() -> {
            try {
                // Download, blocking THIS background thread but not the main one
                URL url = new URL(logoURL);
                final Bitmap bmp = BitmapFactory.decodeStream(url.openConnection().getInputStream());

                // Go back to the main thread and set the image bitmap
                mainThread.post(() -> mView.setImageBitmap(bmp));
            } catch (Exception e) {
                Log.e("ReactImageManager", "Error : " + e.getMessage());
            }
        }).start();
    }
}
```

To use this in your JSX, use `requireNativeComponent` like so:

```jsx
import { requireNativeComponent } from "react-native";
const MyImageView = requireNativeComponent("MyImageView");

// ...
<MyImageView style={{ width: 200, height: 100 }} />;
```



# React Native Colo Loco 🤪

Have you ever needed to write a native iOS and Android module but find yourself deep in Stack Overflow and digging through Xcode and Android Studio?

This library makes it as simple as dropping your Objective-C, Java, Swift, and Kotlin files right next to your JavaScript/TypeScript files.

Colo Loco will find your colocated native files, automatically link them up to the Xcode and Android Studio projects, and you can focus on your code.

![Colo Loco in action](https://user-images.githubusercontent.com/1479215/141171825-7dd5afa7-eb75-44ea-b653-04372a47e710.png)

<table>
<tr>
<td>
<img src="https://user-images.githubusercontent.com/1479215/143302440-aac06fbb-21ed-492a-85e3-eaee375740b3.png" width="200" alt="iOS simulator showing native alert popup" />
</td>
<td>
<img src="https://user-images.githubusercontent.com/1479215/143302906-1402b95f-6e53-429f-9013-a0de3ecb1f9e.png" width="200" alt="Android emulator showing native alert pop-up" />
</td>
</tr>
</table>

### Watch Jamon show how to use React Native Colo Loco!

<a href="https://www.youtube.com/watch?v=gfORZXq4ZgE" target="_blank"><img width="500" alt="CleanShot 2023-03-02 at 08 31 33@2x" src="https://user-images.githubusercontent.com/1479215/222491788-3df92769-cd9d-4ab8-9b35-54cd427f36a9.png"><a/>

## Installation

_Note that Colo Loco doesn't (yet) support Expo._

Add Colo Loco to your development dependencies:

```
npm install -D react-native-colo-loco
# or
yarn add -D react-native-colo-loco
```

Once you have installed `react-native-colo-loco`, you can try running our setup script. This will attempt to automatically patch the necessary files.

```
npx install-colo-loco
```

_NOTE: It's recommended to run this script with a clean git working tree; if you want to continue without a dirty working tree pass it the `--no-git-check` flag_

Lastly, install pods and run the project to finish installation and compile.

```
npx pod-install
npm run ios
npm run android
```

_NOTE: If this doesn't work or you have a non-standard project structure, try the manual instructions below._

### iOS Manual Installation

<details>
  <summary>Click to expand iOS manual instructions</summary>

For iOS, add this to your Podfile (`ios/Podfile`) (don't forget to change `MyApp` to your actual app name):

```ruby
require_relative '../node_modules/react-native-colo-loco/scripts/ios.rb'
link_colocated_native_files(app_name: 'MyApp', app_path: "../app")
```

</details>

#### Exclude specific Xcode targets

In some cases you may want to exclude certain targets from being linked. For example, if you have a `MyAppTests` target, you may not want to link your native files into that target. To do this, the `exclude_targets` option flag specifies an array of target names to exclude. Just add the following to your Podfile:

```ruby
link_colocated_native_files(
  app_name: 'MyApp',
  app_path: "../app",
  exclude_targets: ['MyAppTests']
)
```

You can also specify on an individual file basis which targets you want to link. Add a comment somewhere in the file (recommended near the top) with the following format:

```swift
// colo_loco_targets: TestApp, TestAppTests
```

This will link the file into the `TestApp` and `TestAppTests` targets, but not any other targets.

Note that this comment-based approach will take precedence over the `exclude_targets` option.

### Android Manual Installation

<details>
  <summary>Click to expand Android manual instructions</summary>
  
Create a "package" file for your project in `./android/app/src/main/java/com/myapp/MyAppPackage.java` (but replace `myapp` and `MyApp` with your app's package name and app name).

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
      List<ViewManager> modules = new ArrayList<>();

      // Add all react-native-colo-loco native view managers from ./colocated/ColoLoco.java
      modules.addAll(ColoLoco.colocatedViewManagers(reactContext));

      return modules;
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

</details>

## Usage

For native iOS and Android modules and view managers, place your .m, .h, .swift, .java, and .kt files anywhere near your JavaScript/JSX files. They'll be linked in automatically when you run `pod install`, or in Android's case, when you run `npm run android`. If the filename ends in \*ViewManager, it'll be linked as a view manager.

```
ios/
android/
app/
  components/
    MyButton.tsx
    MyNativeButtonViewManager.h
    MyNativeButtonViewManager.m
    MyNativeButtonViewManager.java
    MyNativeModule.h
    MyNativeModule.m
    MyNativeModule.java
```

## Examples

### iOS Objective-C Example

Let's build a small native module that shows an alert.

In a fresh React Native project, install `react-native-colo-loco` (see instructions above) and then make a folder called `app`. Place two files inside of that -- `Jamon.h` and `Jamon.m`.

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
import { NativeModules } from "react-native"
const { Jamon } = NativeModules

// Now run it:
Jamon.hello()
```

Run `npx pod-install` in your terminal and then run your project with `yarn ios` (or `yarn react-native run-ios`).

You should see the native alert pop up in your app!

<img src="https://user-images.githubusercontent.com/1479215/143302440-aac06fbb-21ed-492a-85e3-eaee375740b3.png" width="200" alt="iOS simulator showing native alert popup" />

Hint: You can read a lot more about iOS native modules here: [https://reactnative.dev/docs/native-modules-ios](https://reactnative.dev/docs/native-modules-ios)

### Android Java example

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
import { NativeModules } from "react-native"
const { Jamon } = NativeModules

Jamon.hello()
```

<img src="https://user-images.githubusercontent.com/1479215/143302247-48af4a07-b4c3-4b05-9f6c-70c66566ed75.png" width="200" alt="Android emulator showing native alert pop-up" />

### iOS Swift Example

Swift requires a bit more setup, but after that you should be able to drop in `.swift` files and have them work. Unfortunately, as of now, Swift files still require a `.m` file to expose them to React Native, so you'll still be making two files.

_Note that if you used a recent version of [Ignite](https://github.com/infinitered/ignite) to create your app, Swift is already set up._

<details>
  <summary>To set up Swift in your project (only has to be done once), click here to expand.</summary>

First, open your xcworkspace file (in the `./ios` folder) in Xcode.

Click File -> New -> New File in the menu (or hit Cmd+N).

Choose "Swift File" under the `Source` section. Name it something like `EnableSwift` and click Create.

Xcode should prompt you with this prompt:
`Would you like to configure an Objective-C bridging header?`

Click `Create bridging header` (this is key).

Inside that file, add this line:

```objc
//
//  Use this file to import your target's public headers that you would like to expose to Swift.
//
#import <React/RCTBridgeModule.h>
```

Save it, and you now have Swift support. You can close Xcode and let your Mac take a breather.

</details>

Now, it's just a matter of adding Swift files to your project. Inside the `./app` folder you created in the previous section, add the following `Gant.swift` file:

```swift
// Gant.swift
import Foundation
import UIKit

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

```objc
// Gant.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Gant, NSObject)
RCT_EXTERN_METHOD(hello)
+ (BOOL)requiresMainQueueSetup { return NO; }
@end
```

In your `App.js`, just use it like you did the `Jamon` native module:

```jsx
import { NativeModules } from "react-native"
const { Gant } = NativeModules

Gant.hello()
```

Don't forget to run `npx pod-install` to link up the new native files.

Then run `yarn ios` to recompile. You should see the alert pop up! Yay!

### Android Kotlin Example

Create a file called `Gant.kt` in your `app` folder and drop in these contents:

```kotlin
package com.myapp // change to your package name

import android.app.AlertDialog
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

// change to your app's package name
class Gant internal constructor(context: ReactApplicationContext?) : ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "Gant"
    }

    @ReactMethod
    fun hello() {
        // Display a pop-up alert
        val builder = AlertDialog.Builder(currentActivity)
        builder.setMessage("Hi, everybody!")
                .setTitle("Gant")
                .setPositiveButton("OK", null)
        val dialog = builder.create()
        dialog.show()
    }
}
```

In your `App.js`, just use it like you did the `Jamon` Java native module:

```jsx
import { NativeModules } from "react-native"
const { Gant } = NativeModules

Gant.hello()
```

## Native UI Components

Native modules are fun, but even more fun are native UI components.

### Native iOS UI Components

To create a native iOS UI component, you can add a ViewManager Objective-C file and header anywhere in your JS folder.

Here's an example that downloads and shows a remote image:

```objc
// app/components/MyImageViewManager.h
#import <React/RCTViewManager.h>
#import "UIKit/UIKit.h"
@interface MyImageViewManager : RCTViewManager
@end
```

```objc
// app/components/MyImageViewManager.m
#import "MyImageViewManager.h"

@implementation MyImageViewManager

UIImageView *wrapper;

RCT_EXPORT_MODULE(MyImageViewManager)

- (UIView *)view
{
  wrapper = [[UIImageView alloc] initWithImage:[UIImage new]];
  [self performSelectorInBackground:@selector(loadImageAsync) withObject:nil];
  return wrapper;
}

- (void) loadImageAsync
{
  NSURL *url = [NSURL URLWithString:@"https://logos-world.net/wp-content/uploads/2021/10/Meta-facebook-Logo-700x394.png"];
  // stops the UI until it finishes downloading
  NSData *data = [NSData dataWithContentsOfURL:url];
  UIImage *image = [[UIImage alloc] initWithData:data];
  dispatch_async(dispatch_get_main_queue(), ^{
    wrapper.image = image;
  });
}

@end
```

To use this in your JSX, use `requireNativeComponent` like so:

```jsx
import { requireNativeComponent } from "react-native"
const MyImageView = requireNativeComponent("MyImageView")

function MyComponent() {
  return <MyImageView style={{ width: 200, height: 100 }} />
}
```

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
import { requireNativeComponent } from "react-native"
const MyImageView = requireNativeComponent("MyImageView")

function MyComponent() {
  return <MyImageView style={{ width: 200, height: 100 }} />
}
```

#### Kotlin Example

If your project is Kotlin-ready, you can drop in a Kotlin view manager and use it like so:

```kt
package com.myapp

import android.widget.TextView
import android.graphics.Color
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.bridge.ReactApplicationContext

class WelcomeViewManager (reactAppContext: ReactApplicationContext) : SimpleViewManager<TextView>() {
  override fun getName(): String {
    return "WelcomeView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): TextView {
    val welcomeTextView: TextView = TextView(reactContext)
    welcomeTextView.text = "WELCOME!"
    return welcomeTextView
  }

  @ReactProp(name = "text")
  fun setTextFromProp(view: TextView, myText: String) {
    view.text = "${myText.uppercase()}!"
  }

  @ReactProp(name = "textColor")
  fun setTextColorFromProp(view: TextView, myTextColor: String) {
    // set text color
    view.setTextColor(Color.parseColor(myTextColor))
  }
}
```

Then, in your JSX/TSX:

```jsx
const WelcomeView = requireNativeComponent("WelcomeView")

function MyWelcomeView() {
  return <WelcomeView text="Welcome!" textColor="#FFFFFF" style={{ width: 200, height: 100 }} />
}
```

You should see the text show up in your app!

## License

This package is licensed under the MIT license.

## Limitations/Assumptions

### Android assumptions

On Android, our assumption is that your native files live in your app's main package (`com.yourpackage`). If you need them to live in their own package, you may not be able to colocate those files.

We've considered adding some magic comments to allow for more fine-grained control over package imports and instantiation. For example, something like this (it's not implemented yet so don't try it):

```java
// @import-template import com.myotherpackage
// @instantiation-template new MyModule(null, "Hello", false)
// @instantiate false
```

However, these are edge-cases, and likely best if you create your own package / imports in the `./android/src/...` folder yourself.

## Troubleshooting

1. On iOS, make sure you've run `npx pod-install` to link any new / changed native modules before building your app
2. If you're getting obscure native errors, try opening the project in Android Studio or Xcode and building from there to get more targeted errors
3. If you think the issue is with React Native Colo Loco, try creating a brand-new app using the instructions earlier in the README and replicate the problem there. Then file an issue with a link to the replication repo. Issues without replication steps or repos will most likely be closed without resolution because who's got time for that?

If you continue having problems, join the Infinite Red Slack community at <https://community.infinite.red> and ask in the #react-native channel. Make sure to mention you are using React Native Colo Loco.

If you need help from pros, consider hiring [Infinite Red](https://infinite.red/reactnative), my React Native consulting company.


## Contributing to React Native Colo Loco

If you're interested in contributing to this project, we have a [YouTube video](https://www.youtube.com/watch?v=ucEBfIZOap8) that demonstrates the process. The video is a demo of contributing to React Native Colo Loco, not a tutorial. It provides a practical example of how you can contribute to this project. 

In the video, you'll see how to add a new feature requested by one of our project teams at Infinite Red. The video also covers test-driven development with ChatGPT and Github Copilot. 

Please like the video & subscribe to the channel! And let us know on Twitter what you think.


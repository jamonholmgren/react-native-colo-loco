# React Native Colocate Native

Hey! You found an experiment that I'm working on. Fun fun.

This library (theoretically) lets you colocate your native files with your React Native JavaScript files.

## Installation

Add this library to your development dependencies:

```
npm install --save-dev react-native-colocate-native
# or
yarn add -D react-native-colocate-native
```

For iOS, add this to your Podfile (`ios/Podfile`):

```ruby
require_relative '../node_modules/react-native-colocate-native/scripts/ios.rb'

link_colocated_native_files(app_name: 'MyApp', app_path: "../app")
```

For Android, well, you'll have to wait. Haven't got to that yet.

## Usage

For native Objective-C and Java modules, place your .m, .h, .swift, and .java files anywhere near your JavaScript/JSX files. They'll be linked in automatically when you run `npx pod-install` or `pod install`.

```
ios/
android/
app/
  components/
    MyButton.tsx
    MyButton.h
    MyButton.m
    MyButton.java (coming soon)
```

### Example

Let's build a small native module.

In a fresh React Native project, make a folder called `app`. Place two files inside of that -- `Jamon.h` and `Jamon.m`.

```tsx
// app/Jamon.h
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

If you haven't added the module yet, run `npm i --save-dev react-native-colocate-native` and then modify your Podfile (replace `MyApp` with your actual app name):

```ruby
require_relative '../node_modules/react-native-colocate-native/scripts/ios.rb'

link_colocated_native_files(app_name: 'MyApp', app_path: "../app")
```

Run `npx pod-install` in your terminal and then run your project with `yarn ios` (or `yarn react-native run-ios`).

You should see the native alert pop up in your app!

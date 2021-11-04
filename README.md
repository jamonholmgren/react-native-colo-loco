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
require_relative '../node_modules/react-native-colocated-native/scripts/ios.rb'

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

In a fresh React Native project, make a folder called `app`. Place three files inside of that -- `Jamon.tsx`, `Jamon.h`, and `Jamon.m`.

```tsx
// app/Jamon.tsx
```

```tsx
// app/Jamon.h
#import <React/RCTBridgeModule.h>
@interface Jamon : NSObject <RCTBridgeModule>
@end
```

```tsx
// Jamon.m
#import "Jamon.h"
#import <React/RCTLog.h>

@implementation Jamon

// To export a module named Jamon
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(cool)
{
 RCTLogInfo(@"This is cool!");
}

@end
```

Next, run `npx pod-install` in your terminal.

// Foo.m
#import "Foo.h"

@implementation Foo

RCT_EXPORT_MODULE();

// Export a method -- `Foo.hello()`
RCT_EXPORT_METHOD(hello)
{
  // Alerts have to go on the main thread
  dispatch_async(dispatch_get_main_queue(), ^{
    UIAlertView *alert = [[UIAlertView alloc]
      initWithTitle: @"Hello from native!"
      message: @"This is from Foo.m"
      delegate: self
      cancelButtonTitle: @"Cancel"
      otherButtonTitles: @"Say Hello",
      nil
    ];
    [alert show];
  });
}

@end

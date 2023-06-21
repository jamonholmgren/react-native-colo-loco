// FooViewManager.h
// colo_loco_targets: TestApp, TestAppTests
#import "FooViewManager.h"

@implementation FooViewManager

UIImageView *wrapper;

RCT_EXPORT_MODULE(FooViewManager)

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

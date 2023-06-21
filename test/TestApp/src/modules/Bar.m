// Bar.m
// colo_loco_targets: TestApp
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Bar, NSObject)
RCT_EXTERN_METHOD(hello)
+ (BOOL)requiresMainQueueSetup { return NO; }
@end

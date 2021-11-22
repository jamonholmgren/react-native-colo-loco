
package com.testapp;

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

public class FooViewManager extends SimpleViewManager<ReactImageView> {
  public static final String REACT_CLASS = "FooView";

  ReactApplicationContext mCallerContext;
  ReactImageView mView;

  private final String logoURL = "https://logos-world.net/wp-content/uploads/2021/10/Meta-facebook-Logo-700x394.png";

  public FooViewManager(ReactApplicationContext reactContext) {
    mCallerContext = reactContext;
  }

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  protected ReactImageView createViewInstance(ThemedReactContext reactContext) {
    mView = new ReactImageView(reactContext, Fresco.newDraweeControllerBuilder(), null, mCallerContext);
    final Handler mainThread = new Handler();
    startDownloading(mainThread);
    return mView;
  }

  private void startDownloading(final Handler mainThread) {
    new Thread(() -> {
      try {
        URL url = new URL(logoURL);
        final Bitmap bmp = BitmapFactory.decodeStream(url.openConnection().getInputStream());
        mainThread.post(() -> mView.setImageBitmap(bmp));
      } catch (Exception e) {
        Log.e("ReactImageManager", "Error : " + e.getMessage());
      }
    }).start();
  }
}

// Foo.java
package com.testapp;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.app.AlertDialog;

public class Foo extends ReactContextBaseJavaModule {
  Foo(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "Foo";
  }

  @ReactMethod
  public void hello() {
    // Display a pop-up alert
    AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
    builder.setMessage("Hi, everybody!")
      .setTitle("Foo")
      .setPositiveButton("OK", null);
    AlertDialog dialog = builder.create();
    dialog.show();
  }
}

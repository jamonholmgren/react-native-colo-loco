package com.testapp

import android.widget.TextView
import android.graphics.Color
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.bridge.ReactApplicationContext

class BarViewManager (reactAppContext: ReactApplicationContext) : SimpleViewManager<TextView>() {
  override fun getName(): String {
    return "BarView"
  }

  override fun createViewInstance(reactContext: ThemedReactContext): TextView {
    val welcomeTextView: TextView = TextView(reactContext)
    welcomeTextView.text = "WELCOME!"
    return welcomeTextView
  }

  @ReactProp(name = "text")
  fun setTextFromProp(view: TextView, myText: String) {
    view.text = "WELCOME ${myText.uppercase()}!"
  }

  @ReactProp(name = "textColor")
  fun setTextColorFromProp(view: TextView, myTextColor: String) {
    // set text color
    view.setTextColor(Color.parseColor(myTextColor))
  }
}
// Bar.swift
import Foundation
import UIKit

@objc(Bar)
class Bar : NSObject {
  @objc func hello() {
    // Alerts have to go on the main thread
    DispatchQueue.main.async {
      let alert = UIAlertView(
        title: "Hello from native!",
        message: "This is from Bar.swift",
        delegate: nil,
        cancelButtonTitle: "Cancel",
        otherButtonTitles: "Say Hello"
      )
      alert.show()
    }
  }
}

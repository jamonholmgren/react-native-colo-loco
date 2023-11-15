// TL;DR: This file is included and executed from `./android/settings.gradle`
// like this:
//
// apply from: new File(["node", "--print", "require.resolve('react-native-colo-loco/package.json')"].execute(null, rootDir).text.trim(), "../scripts/android.groovy")
// linkColocatedNativeFiles([ appName: rootProject.name, appPath: "../app", appPackageName: "com.myapp", androidPath: "./android/app/src/main/java/com/myapp" ])

import java.util.regex.Pattern
import java.util.regex.Matcher
import java.nio.file.Files
import java.nio.file.Paths

def colocateFiles(filesToColocate, androidPath) {
  for (fileToColocate in filesToColocate) {
    // shell out to ln to make a hardlink to the file in the android path
    def linkPath = Paths.get("${System.getProperty('user.dir')}/${androidPath}/colocated/${fileToColocate.name}")
    def filePath = Paths.get(fileToColocate.absolutePath)
    Files.createLink(linkPath, filePath)
  }
}

// Move the colocateFiles function definition to the top of the file, before the ext.linkColocatedNativeFiles function
ext.linkColocatedNativeFiles = { Map customOptions = [:] ->
  // strip "./android/" from the androidPath
  def androidPath = customOptions.androidPath.replace("android/", "")

  // get all of the colocated Java and Kotlin files
  def colocatedKotlinFiles = new FileNameFinder().getFileNames("${System.getProperty('user.dir')}/${customOptions.appPath}", "**/*.kt", "")
  def colocatedJavaFiles = new FileNameFinder().getFileNames("${System.getProperty('user.dir')}/${customOptions.appPath}", "**/*.java", "")

  // combine colocatedKotlinFiles and colocatedJavaFiles
  def allColocatedFiles = colocatedKotlinFiles + colocatedJavaFiles

  // make an array to hold the files to be colocated
  def filesToColocate = new ArrayList<File>()

  def moduleInstantiationString = ""
  def viewManagerInstantiationString = ""

  // loop through allColocatedFiles and check if the class name matches the file name
  for (filepath in allColocatedFiles) {
    // read file from filepath
    def file = new File(filepath)
    
    def classString = "class "

    // find classString in file contents
    String fileText = file.text
    def classIndex = fileText.indexOf(classString)

    // get the file name from the file path
    def fileName = file.getName()

    // if classString is found, get the class name
    if (classIndex != -1) {
      // def restOfClass = fileText.substring(classIndex + classString.length(), fileText.length())
      // get the first word from the restOfClass as className
      // def className = restOfClass.substring(0, restOfClass.indexOf(" "))

      // use regex to get the className
      def classNamePattern = Pattern.compile("class ([a-zA-Z0-9_]+)")
      def matcher = classNamePattern.matcher(fileText)
      matcher.find()
      def className = matcher.group(1)

      // get the filename without the extension
      def fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf("."))

      // verify that the fileNameWithoutExtension matches the className
      if (fileNameWithoutExtension == className) {
        // add the file to the array to hardlink later
        filesToColocate.add(file)
        
        // if the classname ends in "ViewManager", add to the viewManagerInstantiationString
        if (className.endsWith("ViewManager")) {
          viewManagerInstantiationString += "    viewManagers.add(new ${className}(reactContext));\n"
        } else {
          // it's a normal module, not a view manager
          moduleInstantiationString += "    modules.add(new ${className}(reactContext));\n"
        }
        
      } else {
        println "WARNING: file was not added because the class name ${className} didn't match the filename ${fileName}, skipping"
      }
    } else {
      println "WARNING: file ${fileName} doesn't contain a class, skipping"
    }
  }

  // remove the 'colocated' folder if it exists in the androidPath
  def colocatedFolder = new File("${System.getProperty('user.dir')}/${androidPath}/colocated")
  if (colocatedFolder.exists()) colocatedFolder.deleteDir()
  
  // create the `colocated` folder in the androidPath
  colocatedFolder.mkdir()

  // Call the colocateFiles function
  colocateFiles(filesToColocate, androidPath)
  
  // create the manifest file
  def manifestFile = new File(androidPath + "/colocated/", "ColoLoco.java")

  def manifestText = """
// This file is autogenerated from a react-native-colo-loco script.
// Please do not edit it directly.
package ${customOptions.appPackageName};

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.List;

import android.util.Log;

class ColoLoco {
  // Any colocated modules are added here (except ViewManagers)
  public static List<NativeModule> colocatedModules(ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();
    // This list is auto-generated. Do not edit manually.

${moduleInstantiationString}

    return modules;
  }

  // Any colocated ViewManagers are added here
  public static List<ViewManager> colocatedViewManagers(ReactApplicationContext reactContext) {
    List<ViewManager> viewManagers = new ArrayList<>();
    // This list is auto-generated. Do not edit manually.

${viewManagerInstantiationString}

    return viewManagers;
  }
}
  """

  // write the manifestText to the manifestFile
  manifestFile.write(manifestText)
}


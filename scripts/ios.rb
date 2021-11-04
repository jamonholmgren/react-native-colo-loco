require 'xcodeproj'

# This method will search your project files
# for Objective-C, Swift, or other native files
# and link them in the Xcode project.
#
# They will be grouped into a folder called "Colocated"
# and linked to all available targets.
def link_colocated_native_files(options = {})
  _colocated_verify_options!(options)

  app_name = options[:app_name]
  app_path = options[:app_path]
  project_path = "#{app_name}.xcodeproj"

  # get the colocated files
  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,c,swift}'))

  # if there are any colocated files, let's add them
  if colocated_files.length > 0
    project = Xcodeproj::Project.open(project_path)
    file_group = project[app_name]
    # check if the "Colocated" group exists
    new_group = file_group['Colocated']
    # if not, create it
    new_group ||= file_group.new_group('Colocated')

    puts "Adding co-located native files from #{app_path} to Xcode project"
    colocated_files.each do |file|
      puts "Adding #{file}"
      if new_group.files.map(&:path).include?(file)
        puts "File already exists in Xcode project"
      else
        new_file = new_group.new_file(file)

        # add the new file to all targets
        project.targets.each do |target|
          target.add_file_references([new_file])
        end
      end
    end
    project.save()
  else
    puts "No colocated native files found in #{app_path}"
  end
end

# Verify that the required options were provided
def _colocated_verify_options!(options)
  if options[:app_name].nil?
    raise "link_colocated_native_files - You must specify the name of your app"
  end
  if options[:app_path].nil?
    raise "link_colocated_native_files - You must specify a path to your app"
  end
end

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
  excluded_targets = options[:exclude_targets] || []
  project_path = "#{app_name}.xcodeproj"

  # if app_path/ios/Podfile exists, stop and warn the user
  podfile_path = "#{app_path}/ios/Podfile"
  if File.exist?(podfile_path)
    puts "React Native Colo Loco error:"
    puts "  Podfile found in #{podfile_path}. We don't support specifying"
    puts "  the project root as your app_path."
    puts "  To fix this, change app_path to something like '../app'"
    puts "  (it is currently #{app_path})"
    puts "  Skipping linking of native files."
    puts ""
    return
  end

  # get the colocated files
  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,c,swift}'))

  # if there are any colocated files, let's add them
  if colocated_files.length > 0
    project = Xcodeproj::Project.open(project_path)
    file_group = project[app_name]

    # check if the "Colocated" group exists
    existing_group = file_group['Colocated']

    # remove all files from the existing colocated file_group
    # this is to ensure that we don't have duplicates or other issues
    if existing_group
      existing_group.files.each do |file|
        file.remove_from_project
      end
    end

    # Create the group if it doesn't exist
    colocated_group = existing_group || file_group.new_group('Colocated')

    puts "Adding co-located native files from #{app_path} to Xcode project"
    colocated_files.each do |file|
      relative_file_path = Pathname.new(file).realpath
      puts "Adding #{file}"
      # if colocated_group.files.map(&:path).include?(file)
      #   puts "File already exists in Xcode project"
      # else
        new_file = colocated_group.new_file(relative_file_path)

        # add the new file to all targets
        project.targets.each do |target|
          if excluded_targets.include?(target.name)
            # Skipping #{target.name} because it is in the excluded_targets list
            next
          end
          target.add_file_references([new_file])
        end
      # end
    end
    project.save
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

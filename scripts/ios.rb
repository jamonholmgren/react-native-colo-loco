require 'xcodeproj'
# Remove files from the existing colocated file_group that are not present in the colocated_files array
def remove_nonexistent_files(existing_group, colocated_files)
  if existing_group
    existing_group.files.each do |file|
      next if colocated_files.include?(file.real_path) # Skip files that are already in the colocated_files array
      file.remove_from_project
    end
  end
end

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

  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,c,swift}')).map { |file| Pathname.new(file).realpath }

  # if there are any colocated files, let's add them
  if colocated_files.length > 0
    project = Xcodeproj::Project.open(project_path)
    file_group = project[app_name]
    existing_group = file_group['Colocated']
    # Create the group if it doesn't exist
    colocated_group = existing_group || file_group.new_group('Colocated')

    colocated_group_files = colocated_group.files.map(&:real_path)

    colocated_files.each do |file|
      next if colocated_group_files.include?(file)

      puts "Adding #{file}"
      new_file = colocated_group.new_file(file)

      # Check if this file specifies any Colo Loco targets
      file_content = File.read(file)
      targets_line = file_content[/colo_loco_targets:(.+)/, 1] # Get the line with the targets, if it exists
      specified_targets = targets_line&.split(',')&.map(&:strip) || []

      # Add the new file to all targets (or only the specified targets, if any)
      project.targets.each do |target|
        # Skip this target if it's in the excluded_targets list or if this file specifies targets and this target isn't one of them
        # next if (specified_targets.any? && !specified_targets.include?(target.name)) || (!specified_targets.any? && excluded_targets.include?(target.name))

        # If there are specified_targets, only add this file to the targets in that list;
        # otherwise, use the excluded_list to determine which targets to add this file to
        if specified_targets.any? ? specified_targets.include?(target.name) : !excluded_targets.include?(target.name)
          target.add_file_references([new_file])
        end
      end
    end

    remove_nonexistent_files(existing_group, colocated_files)

    puts "Adding co-located native files from #{app_path} to Xcode project"

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


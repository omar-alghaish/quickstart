# quickstart

[![npm version](https://img.shields.io/npm/v/quickstart.svg)](https://www.npmjs.com/package/quickstart)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight CLI tool that helps you initialize new projects from custom templates. Save time setting up boilerplate code and ensure consistency across projects.

## Features

* 📝 Create templates from existing projects
* 🚀 Generate new projects with a single command
* 🧩 Easily manage multiple project templates
* 🔍 Selective file/directory copying
* 💻 Interactive and user-friendly CLI
* ✅ Dynamic placeholder replacements (replace `{{variableName}}` in files)
* ✅ Custom post-creation scripts (run npm install, git init, etc.)
* ✅ Non-interactive mode for CI/CD pipelines
* 📦 Export/import templates for sharing between systems

## Installation

```bash
# Install globally using npm
npm i @omar-alghaish/quickstart

# Or using yarn
yarn global add @omar-alghaish/quickstart
```

## Quick Start

### Create a template from an existing project

```bash
# Navigate to your project directory
cd your-awesome-project

# Save it as a template
quickstart init --name my-template
```

### Create a new project from your template

```bash
# Create a new project based on your template
quickstart create my-template --directory new-project
```

### Share your template with others

```bash
# Export your template to a .qst file
quickstart export my-template

# Import a template from a .qst file
quickstart import my-template.qst
```

## Command Reference

### `quickstart init`

Initialize a new template from the current directory.

```bash
quickstart init [options]
```

**Options:**

* `-n, --name <name>` - Name of the template
* `-d, --description <description>` - Description of the template
* `--skip-variables` - Skip defining template variables
* `--skip-scripts` - Skip defining post-creation scripts

**Interactive Prompts:**

* Template name (if not provided via options)
* Template description (if not provided via options)
* Files/directories to ignore (comma-separated patterns)
* Define template variables (for placeholder replacements)
* Define post-creation scripts

**Example:**

```bash
quickstart init --name react-typescript
```

### `quickstart create`

Create a new project from a template.

```bash
quickstart create [template] [options]
```

**Arguments:**

* `template` - Name of the template to use (optional, will prompt if not provided)

**Options:**

* `-d, --directory <directory>` - Target directory for the new project
* `-y, --yes` - Skip all prompts and use defaults
* `-s, --skip-scripts` - Skip running post-creation scripts
* `-v, --vars <jsonString>` - Provide variable values as JSON string

**Interactive Prompts:**

* Template selection (if template not specified)
* Project name/directory (if not provided via options)
* Variable values (if template has variables)
* Scripts to run (if template has scripts)

**Example:**

```bash
quickstart create react-typescript --directory my-new-app
```

### `quickstart export`

Export a template to a shareable .qst file.

```bash
quickstart export <template> [options]
```

**Arguments:**

* `template` - Name of the template to export

**Options:**

* `-o, --output <path>` - Output file path (defaults to `<template>.qst` in current directory)

**Example:**

```bash
quickstart export react-typescript --output ~/templates/react-typescript.qst
```

### `quickstart import`

Import a template from a .qst file.

```bash
quickstart import <file> [options]
```

**Arguments:**

* `file` - Path to the .qst file to import

**Options:**

* `-f, --force` - Overwrite existing template without prompting

**Example:**

```bash
quickstart import ~/templates/react-typescript.qst
```

## Dynamic Placeholder Replacements

When initializing a template, you can define variables that will be used for placeholder replacements in your template files.

For example, if you define a variable `projectName`, any occurrence of `{{projectName}}` in your template files will be replaced with the value provided when creating a new project.

### Built-in Variables

Some variables are automatically available:

* `{{projectName}}` - The name of the target directory
* `{{currentYear}}` - The current year (useful for licenses, etc.)

### Example

A file in your template:

```html
<!DOCTYPE html>
<html>
<head>
  <title>{{projectName}} - {{description}}</title>
</head>
<body>
  <h1>Welcome to {{projectName}}!</h1>
  <p>Created in {{currentYear}}.</p>
</body>
</html>
```

When creating a new project and providing values:

* `projectName` = "awesome-app"
* `description` = "My cool project"

Will become:

```html
<!DOCTYPE html>
<html>
<head>
  <title>awesome-app - My cool project</title>
</head>
<body>
  <h1>Welcome to awesome-app!</h1>
  <p>Created in 2025.</p>
</body>
</html>
```

## Post-Creation Scripts

Post-creation scripts run after a project is created from a template. These can automate tasks like:

* Installing dependencies (`npm install`)
* Initializing git (`git init`)
* Setting up git hooks (`npx husky install`)
* Creating environment files (`cp .env.example .env`)

When initializing a template, you can define scripts that will be offered to run after project creation.

For each script, you can define:

* A name
* The command to run
* A description
* Whether it should run by default

When creating a project from a template, you'll be prompted to select which scripts to run (unless using `--yes` flag, which will run all default scripts).

## Template Sharing

Templates can be shared between different systems or users using the export/import feature.

### Exporting Templates

When you export a template, all files and metadata are compressed into a single `.qst` file:

```bash
quickstart export my-template
```

This creates a `my-template.qst` file in the current directory that contains:

* All template files (except ignored patterns)
* Template metadata (name, description)
* Variable definitions
* Post-creation script definitions

### Importing Templates

To use a shared template, import it with:

```bash
quickstart import path/to/template.qst
```

This adds the template to your local templates directory, making it available for use with the `create` command.

## Non-Interactive Mode

For CI/CD pipelines or scripted usage, you can use the `--yes` flag to run in non-interactive mode:

```bash
quickstart create my-template --yes --directory my-new-project --vars '{"projectName":"awesome","description":"Automated project"}'
```

This will:

1. Create a new project from "my-template"
2. Use default values for all prompts
3. Place the project in "my-new-project" directory
4. Use the provided variable values
5. Run only scripts marked as "runByDefault"

## Use Cases

### React Project Template

Save your preferred React project setup:

```bash
# Create a React project with your preferred setup
npx create-react-app my-react-setup --template typescript
cd my-react-setup

# Add ESLint, Prettier, etc.
npm install eslint prettier eslint-config-prettier --save-dev

# Create custom folder structure
mkdir -p src/{components,hooks,utils,pages,styles}

# Save as template
quickstart init --name react-ts-custom
```

Now you can create new React projects with your preferred setup:

```bash
quickstart create react-ts-custom --directory client-project
```

### Backend API Template

Create an Express API template:

```bash
# Set up Express project
mkdir express-api-template && cd express-api-template
npm init -y
npm install express mongoose dotenv cors helmet

# Create folder structure
mkdir -p src/{controllers,models,routes,middleware,config}

# Add your standard configuration files
touch .env.example .gitignore

# Save as template
quickstart init --name express-api
```

Then create new API projects:

```bash
quickstart create express-api --directory user-service
```

### Sharing Templates with Your Team

Create a standardized template for your team:

```bash
# Create and configure your template
quickstart init --name company-standard

# Export the template for sharing
quickstart export company-standard --output ~/company-standard.qst

# Share the .qst file with your team
```

Team members can import and use the template:

```bash
# Import the shared template
quickstart import ~/company-standard.qst

# Create new projects using the team standard
quickstart create company-standard --directory new-project
```

## How It Works

quickstart stores your templates in `~/.quickstart/templates/` and makes them available across your system. When you create a new project, quickstart copies the template files to your specified directory.

### Template Storage

Templates are stored locally in the following location:

* ​**Linux/macOS**​: `~/.quickstart/templates/`
* ​**Windows**​: `%USERPROFILE%\.quickstart\templates\`

### Template Structure

Templates are stored in `~/.quickstart/templates/{template-name}/`.

Each template includes:

* All files and directories from the source project (except ignored patterns)
* A `.template-meta.json` file with metadata, variables, and scripts

### How .qst Files Work

The `.qst` files created by the `export` command are compressed archives that contain:

1. All template files (excluding any patterns specified during template creation)
2. Template metadata including name, description, variables, and post-creation scripts

These files use a specialized format optimized for template sharing, with ultra compression to minimize file size.

## Advanced Usage

### Manually Editing Templates

You can manually edit templates by navigating to the templates directory and making changes:

```bash
cd ~/.quickstart/templates/my-template
# Make your changes
```

### Template Metadata

Each template includes a metadata file (`.template-meta.json`) that stores information about the template. You can view or edit this file to modify template behavior.

### CI/CD Integration

For automation pipelines, you can use the non-interactive mode to create projects:

```bash
# In your CI pipeline
quickstart create my-template --yes --directory build --vars '{"apiKey":"$CI_API_KEY","version":"1.0.0"}'
```

## Troubleshooting

### Command not found

If the `quickstart` command is not found after installation, make sure your npm global binaries directory is in your PATH.

### Permission errors

If you encounter permission errors when creating templates or projects, check that you have appropriate file access permissions.

### Import/Export issues

If you have trouble importing a `.qst` file, ensure:

* The file has a `.qst` extension
* The file was created using the `export` command
* You have read access to the file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

* Inspired by the need for quick project setups
* Built with TypeScript and Node.js


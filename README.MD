# quickstart

[![npm version](https://img.shields.io/npm/v/quickstart.svg)](https://www.npmjs.com/package/quickstart)[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool that helps you initialize new projects from custom templates. Save time setting up boilerplate code, ensure consistency across projects, and streamline your development workflow with advanced template management features.

## Features

* 📝 **Template Creation**: Create templates from existing projects or GitHub repositories
* 🚀 **Project Generation**: Generate new projects with a single command
* 🧩 **Template Management**: List, update, remove, and get detailed info about templates
* 🔍 **Selective Copying**: Smart file/directory filtering with ignore patterns
* 💻 **Interactive CLI**: User-friendly prompts with non-interactive mode support
* ✅ **Dynamic Replacements**: Replace `{{variableName}}` placeholders in files and directories
* ✅ **Post-Creation Scripts**: Automated setup scripts (npm install, git init, etc.)
* 📦 **Template Sharing**: Export/import templates as compressed .qst files
* 🐙 **GitHub Integration**: Create templates directly from GitHub repositories
* ⚙️ **Configuration Management**: Persistent settings for default values
* 🔄 **Template Updates**: Modify template metadata and rename templates
* 📊 **Detailed Information**: View comprehensive template statistics and content

## Installation

```bash
# Install globally using npm
npm i -g @omar-alghaish/quickstart

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

### Create a template from GitHub

```bash
# Create template from a GitHub repository
quickstart github facebook/react --name react-starter

# Create from specific branch or subdirectory
quickstart github vercel/next.js --branch canary --subdirectory examples/blog
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
* `-s, --skip-variables` - Skip defining template variables
* `-p, --skip-scripts` - Skip defining post-creation scripts

**Interactive Prompts:**

* Template name (if not provided via options)
* Template description (if not provided via options)
* Files/directories to ignore (comma-separated patterns)
* Define template variables (for placeholder replacements)
* Define post-creation scripts

**Example:**

```bash
quickstart init --name react-typescript --description "React with TypeScript setup"
```

### `quickstart github`

Create a template from a GitHub repository.

```bash
quickstart github <repo> [options]
```

**Arguments:**

* `repo` - GitHub repository in format `owner/repo`

**Options:**

* `-n, --name <name>` - Name for the template (defaults to repo name)
* `-d, --description <description>` - Description for the template
* `-b, --branch <branch>` - Branch to clone (default: main/master)
* `-s, --subdirectory <path>` - Use only a subdirectory of the repo
* `--skip-variables` - Skip defining template variables
* `--skip-scripts` - Skip defining post-creation scripts

**Examples:**

```bash
# Create template from entire repository
quickstart github facebook/create-react-app --name cra-template

# Create from specific branch
quickstart github vercel/next.js --branch canary --name nextjs-canary

# Create from subdirectory
quickstart github microsoft/vscode-extension-samples --subdirectory helloworld-sample --name vscode-hello
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

**Examples:**

```bash
# Interactive mode
quickstart create react-typescript --directory my-new-app

# Non-interactive mode with variables
quickstart create api-template --yes --vars '{"projectName":"user-api","port":"3000"}'
```

### `quickstart list`

List all available templates.

```bash
quickstart list [options]
```

**Aliases:**`ls`

**Options:**

* `-d, --detailed` - Show detailed information for each template
* `-j, --json` - Output as JSON format

**Examples:**

```bash
# Simple list
quickstart list

# Detailed view
quickstart list --detailed

# JSON output for scripting
quickstart list --json
```

### `quickstart info`

Show detailed information about a specific template.

```bash
quickstart info <template> [options]
```

**Arguments:**

* `template` - Name of the template

**Options:**

* `-j, --json` - Output as JSON format

**Example:**

```bash
quickstart info react-typescript
```

**Output includes:**

* Template name and description
* Creation date and file count
* Defined variables with defaults and requirements
* Post-creation scripts with commands
* Template path

### `quickstart update`

Update template metadata.

```bash
quickstart update <template> [options]
```

**Arguments:**

* `template` - Name of the template to update

**Options:**

* `-n, --name <name>` - Update template name
* `-d, --description <description>` - Update template description

**Interactive Prompts:**

* New template name (if not provided via options)
* New description (if not provided via options)

**Examples:**

```bash
# Update with options
quickstart update old-name --name new-name --description "Updated description"

# Interactive update
quickstart update my-template
```

**Note:** If you change the template name, the template directory will be renamed accordingly.

### `quickstart remove`

Remove a template.

```bash
quickstart remove <template> [options]
```

**Aliases:**`rm`

**Arguments:**

* `template` - Name of the template to remove

**Options:**

* `-f, --force` - Remove without confirmation

**Examples:**

```bash
# With confirmation
quickstart remove old-template

# Force remove without confirmation
quickstart rm old-template --force
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
quickstart import ~/templates/react-typescript.qst --force
```

### `quickstart config`

Manage configuration settings for default values and preferences.

```bash
quickstart config [options]
```

**Options:**

* `-g, --get <key>` - Get a configuration value
* `-s, --set <key=value>` - Set a configuration value
* `-r, --reset` - Reset configuration to defaults
* `-l, --list` - List all configuration values

**Configuration Keys:**

* `defaultAuthor` - Default author name for templates
* `defaultLicense` - Default license type (e.g., MIT, Apache-2.0)
* `templatesDir` - Custom templates directory path
* `githubToken` - GitHub personal access token for private repos

**Examples:**

```bash
# Interactive configuration
quickstart config

# Set specific values
quickstart config --set defaultAuthor="John Doe"
quickstart config --set defaultLicense="MIT"

# Get a value
quickstart config --get defaultAuthor

# List all settings
quickstart config --list

# Reset to defaults
quickstart config --reset
```

## Advanced Features

### Dynamic Placeholder Replacements

When initializing a template, you can define variables that will be used for placeholder replacements in your template files and directory names.

#### Variable Definition

During template creation, you can define:

* **Variable name** - Used in placeholders as `{{variableName}}`
* **Description** - Help text for users
* **Default value** - Optional default
* **Required flag** - Whether the variable must be provided

#### Built-in Variables

Some variables are automatically available:

* `{{projectName}}` - The name of the target directory
* `{{currentYear}}` - The current year (useful for licenses, etc.)

#### File Content Replacement

Any occurrence of `{{variableName}}` in your template files will be replaced:

```javascript
// package.json template
{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{authorName}}",
  "license": "{{license}}"
}
```

#### Directory Name Replacement

Directory names can also contain placeholders:

```
src/
  {{projectName}}-core/
    index.js
  {{projectName}}-utils/
    helpers.js
```

### Post-Creation Scripts

Automate common setup tasks after project creation:

#### Script Definition

When creating a template, define scripts with:

* **Name** - Identifier for the script
* **Command** - Shell command to execute
* **Description** - What the script does
* **Run by default** - Whether to run automatically in `--yes` mode

#### Common Script Examples

```bash
# Install dependencies
npm install

# Initialize git repository
git init && git add . && git commit -m "Initial commit"

# Set up git hooks
npx husky install

# Copy environment file
cp .env.example .env

# Build the project
npm run build

# Run initial tests
npm test
```

#### Script Execution

Scripts run in the newly created project directory and can:

* Access all template variables as environment variables
* Chain multiple commands with `&&` or `;`
* Use conditional logic with shell operators

### GitHub Integration

Create templates directly from any public GitHub repository:

#### Repository Cloning

* Automatically clones the specified repository
* Supports branch selection for different versions
* Can extract subdirectories for monorepo templates
* Removes `.git` directory automatically

#### Branch and Tag Support

```bash
# Use specific branch
quickstart github facebook/react --branch main

# Use specific tag
quickstart github facebook/react --branch v18.2.0
```

#### Subdirectory Extraction

Perfect for monorepos or repositories with multiple examples:

```bash
# Extract specific example
quickstart github vercel/next.js --subdirectory examples/with-typescript

# Create from nested directory
quickstart github microsoft/TypeScript --subdirectory samples/basic
```

### Template Sharing and Distribution

#### .qst File Format

The `.qst` format is a compressed archive containing:

* All template files (excluding ignored patterns)
* Template metadata (variables, scripts, etc.)
* Compression for minimal file size
* Integrity verification

#### Team Distribution

```bash
# Create and share team standard
quickstart init --name company-standard
quickstart export company-standard --output company-standard.qst

# Distribute via shared drive, email, or repository
# Team members import with:
quickstart import company-standard.qst
```

#### Version Control Integration

Store .qst files in repositories for team access:

```bash
# In your team's shared repository
mkdir templates/
quickstart export react-setup --output templates/react-setup.qst
git add templates/
git commit -m "Add React template"
```

### Configuration Management

#### Persistent Settings

Configuration is stored in `~/.quickstart/config.json` and persists across sessions:

```json
{
  "defaultAuthor": "John Doe",
  "defaultLicense": "MIT",
  "templatesDir": "~/custom-templates",
  "githubToken": "ghp_xxxxxxxxxxxxx"
}
```

#### Template Variables Integration

Configuration values can be used as default variable values during template creation, reducing repetitive input.

## Use Cases and Examples

### React Project Template with Full Setup

```bash
# Create a comprehensive React setup
npx create-react-app my-react-setup --template typescript
cd my-react-setup

# Add development tools
npm install -D eslint prettier husky lint-staged @testing-library/react

# Add UI libraries
npm install @mui/material @emotion/react @emotion/styled

# Create folder structure
mkdir -p src/{components,hooks,utils,pages,styles,types}

# Add configuration files
echo '{"semi": true, "singleQuote": true}' > .prettierrc
echo 'module.exports = { extends: ["react-app"] }' > .eslintrc.js

# Save as template with variables and scripts
quickstart init --name react-pro-setup
```

Variables defined:

* `projectName` - For package.json name
* `description` - For package.json description
* `authorName` - For package.json author
* `gitRepo` - For package.json repository

Scripts defined:

* Install dependencies: `npm install`
* Git initialization: `git init && git add . && git commit -m "Initial commit"`
* Husky setup: `npx husky install`

### Backend API Template with Database

```bash
# Set up comprehensive API template
mkdir express-api-pro && cd express-api-pro

# Initialize package.json
npm init -y

# Install dependencies
npm install express mongoose dotenv cors helmet bcryptjs jsonwebtoken
npm install -D nodemon jest supertest

# Create structure
mkdir -p src/{controllers,models,routes,middleware,config,utils,tests}
mkdir -p docs/{api,deployment}

# Add configuration
echo "NODE_ENV=development\nPORT=3000\nDB_URI=mongodb://localhost:27017/{{projectName}}" > .env.example

# Save as template
quickstart init --name express-api-pro
```

### Microservice Template from GitHub

```bash
# Create microservice template from existing repository
quickstart github nestjs/nest-microservices-example --name microservice-starter

# Or create from a specific microservice example
quickstart github microsoft/nodejs-microservices --subdirectory services/user-service --name user-microservice
```

### Documentation Site Template

```bash
# Create from Docusaurus
quickstart github facebook/docusaurus --subdirectory packages/create-docusaurus/templates/classic --name docs-site

# Create from VuePress
quickstart github vuejs/vuepress --subdirectory docs --name vue-docs
```

### Multi-Language Project Template

```bash
# Create polyglot template
mkdir fullstack-template && cd fullstack-template

# Frontend structure
mkdir -p frontend/{src,public,tests}
echo '{"name": "{{projectName}}-frontend"}' > frontend/package.json

# Backend structure  
mkdir -p backend/{src,tests,config}
echo '{"name": "{{projectName}}-backend"}' > backend/package.json

# Infrastructure
mkdir -p infra/{docker,k8s,terraform}
echo 'version: "3.8"' > docker-compose.yml

# Documentation
mkdir -p docs/{api,frontend,backend,deployment}

# Save as template
quickstart init --name fullstack-template
```

## Template Management Best Practices

### Naming Conventions

* Use descriptive, lowercase names with hyphens: `react-typescript-mui`
* Include technology stack: `node-express-mongo`
* Version templates: `api-template-v2`

### Variable Strategy

* Use consistent variable names across templates
* Provide sensible defaults
* Mark essential variables as required
* Use descriptive variable descriptions

### Script Organization

* Order scripts logically (dependencies → setup → build → test)
* Use descriptive script names
* Set appropriate defaults for `runByDefault`
* Test scripts before saving template

### File Organization

* Use meaningful ignore patterns
* Exclude environment-specific files
* Include example/template configuration files
* Document any manual setup steps

## Troubleshooting

### Common Installation Issues

**Command not found after installation:**

```bash
# Check npm global bin directory
npm config get prefix

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="$(npm config get prefix)/bin:$PATH"
```

**Permission errors on macOS/Linux:**

```bash
# Use npm's built-in fix
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Template Creation Issues

**GitHub clone failures:**

* Ensure repository exists and is public
* Check internet connection
* Verify repository name format (owner/repo)

**Variable replacement not working:**

* Check placeholder syntax: `{{variableName}}` (double braces)
* Ensure variable names match exactly
* Verify no extra spaces in placeholders

**Script execution failures:**

* Test commands manually in terminal
* Check file permissions for scripts
* Verify all dependencies are available

### Import/Export Issues

**Import failures:**

* Ensure file has `.qst` extension
* Verify file wasn't corrupted during transfer
* Check file permissions

**Export size concerns:**

* Review ignore patterns to exclude large files
* Consider excluding `node_modules`, `dist`, `.git`
* Use compression-friendly file formats

## Performance and Limits

### Template Size Recommendations

* **Small templates** (< 100 files): Ideal for quick setup
* **Medium templates** (100-1000 files): Good for full applications
* **Large templates** (> 1000 files): Consider using subdirectories or multiple templates

### Memory Usage

The tool loads templates into memory during processing:

* Small templates: < 10MB RAM
* Large templates: May use 100+ MB RAM temporarily
* .qst files are compressed to minimize disk usage

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/omar-alghaish/quickstart.git
cd quickstart

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Contribution Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Update documentation if needed
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Feature Requests

Have an idea for a new feature? Please:

1. Check existing issues first
2. Create a detailed feature request
3. Explain the use case and benefits
4. Consider backwards compatibility


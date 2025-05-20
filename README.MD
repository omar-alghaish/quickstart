# quickstart

[![npm version](https://img.shields.io/npm/v/quickstart.svg)](https://www.npmjs.com/package/quickstart)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight CLI tool that helps you initialize new projects from custom templates. Save time setting up boilerplate code and ensure consistency across projects.

## Features

- 📝 Create templates from existing projects
- 🚀 Generate new projects with a single command
- 🧩 Easily manage multiple project templates
- 🔍 Selective file/directory copying
- 💻 Interactive and user-friendly CLI

## Installation

```bash
# Install globally using npm
npm install -g quickstart

# Or using yarn
yarn global add quickstart
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

## Command Reference

### `quickstart init`

Initialize a new template from the current directory.

```bash
quickstart init [options]
```

**Options:**

- `-n, --name <name>` - Name of the template

**Interactive Prompts:**

- Template name (if not provided via options)
- Files/directories to ignore (comma-separated patterns)

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

- `template` - Name of the template to use (optional, will prompt if not provided)

**Options:**

- `-d, --directory <directory>` - Target directory for the new project

**Interactive Prompts:**

- Template selection (if template not specified)
- Project name/directory (if not provided via options)

**Example:**

```bash
quickstart create react-typescript --directory my-new-app
```

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

## How It Works

quickstart stores your templates in `~/.quickstart/templates/` and makes them available across your system. When you create a new project, quickstart copies the template files to your specified directory.

## Template Storage

Templates are stored locally in the following location:

- **Linux/macOS**: `~/.quickstart/templates/`
- **Windows**: `%USERPROFILE%\.quickstart\templates\`

## Advanced Usage

### Manually Editing Templates

You can manually edit templates by navigating to the templates directory and making changes:

```bash
cd ~/.quickstart/templates/my-template
# Make your changes
```

### Template Metadata

Each template includes a metadata file (`.template-meta.json`) that stores information about the template. You can view or edit this file to modify template behavior.

## Troubleshooting

### Command not found

If the `quickstart` command is not found after installation, make sure your npm global binaries directory is in your PATH.

### Permission errors

If you encounter permission errors when creating templates or projects, check that you have appropriate file access permissions.

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

- Inspired by the need for quick project setups
- Built with TypeScript and Node.js

#!/usr/bin/env node

/**
 *  npm install path --save-dev
 *  npm install postcss --save-dev
 *  npm install tslib --save-dev
 */


const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory where the text files are located
const baseDir = path.join('Templates', 'Snippets'); // Update this to your actual base directory

/**
 * Sanitizes a string by replacing invalid characters with hyphens,
 * removing extra hyphens, trimming leading/trailing hyphens,
 * and converting to lowercase.
 * @param {string} name - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitizeName(name) {
  if (typeof name !== 'string') {
    console.error('sanitizeName received a non-string value:', name);
    return ''; // Prevent further errors by returning an empty string
  }
  return name
    .replace(/[^a-zA-Z0-9\-]/g, '-') // Replace invalid characters with hyphens
    .replace(/-+/g, '-')             // Replace multiple hyphens with a single hyphen
    .replace(/^-|-$/g, '')           // Remove leading or trailing hyphens
    .toLowerCase();
}

/**
 * Converts a string of digits to their corresponding word equivalents.
 * @param {string} digitStr - The string containing digits.
 * @returns {string} - The converted string with digits in words.
 */
function digitToWord(digitStr) {
  if (typeof digitStr !== 'string') {
    console.error('digitToWord received a non-string value:', digitStr);
    return ''; // Prevent further errors by returning an empty string
  }
  const digitWords = {
    '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
    '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
  };
  return digitStr.split('').map(digit => digitWords[digit] || digit).join('');
}

/**
 * Replaces numbers and patterns like '2x2' with their word equivalents.
 * @param {string} word - The string to process.
 * @returns {string} - The processed string with numbers replaced by words.
 */
function replaceNumbersWithWords(word) {
  if (typeof word !== 'string') {
    console.error('replaceNumbersWithWords received a non-string value:', word);
    return ''; // Prevent further errors by returning an empty string
  }
  // Handle patterns like '2x2', '3x3', etc.
  word = word.replace(/(\d+)x(\d+)/gi, (match, p1, p2) => {
    return digitToWord(p1) + 'by' + digitToWord(p2);
  });
  // Replace any remaining numbers
  return word.replace(/\d+/g, (digits) => digitToWord(digits));
}

/**
 * Converts a string to Title Case.
 * @param {string} str - The string to convert.
 * @returns {string} - The Title Cased string.
 */
function toTitleCase(str) {
  if (typeof str !== 'string') {
    console.error('toTitleCase received a non-string value:', str);
    return ''; // Prevent further errors by returning an empty string
  }
  return str.replace(/\w\S*/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Converts CamelCase to kebab-case
 * @param {string} str - The CamelCase string
 * @returns {string} - The kebab-case string
 */
function camelCaseToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Generates component and module names and paths based on directory structure and file names.
 * @param {string} relativeDir - The relative directory path from baseDir.
 * @param {string} fileName - The name of the text file.
 * @param {string[]} originalDirParts - The original directory parts before sanitization.
 * @returns {object} - An object containing various generated names and paths.
 */
function generateComponentData(relativeDir, fileName, originalDirParts) {
  // Split the relative directory into parts and sanitize each part
  const dirParts = relativeDir
    .split(path.sep)
    .map((dir) => {
      const sanitizedDir = sanitizeName(dir.trim().replace(/\s+/g, '-'));
      console.log('Sanitizing directory part:', dir, '->', sanitizedDir);
      return replaceNumbersWithWords(sanitizedDir);
    });

  const dirPath = dirParts.join(path.sep);

  // Process the file base name
  let fileBaseName = path.basename(fileName, '.txt').replace(/\s+/g, '-');
  console.log('Sanitizing file base name:', path.basename(fileName, '.txt'), '->', fileBaseName);
  fileBaseName = replaceNumbersWithWords(sanitizeName(fileBaseName));

  const componentPath = path.join(dirPath, fileBaseName); // Path relative to 'src/app/'

  const componentName = fileBaseName;

  // Generate class name from the file name (short name)
  const componentClassName =
    componentName
      .split('-')
      .filter(Boolean) // Remove empty strings
      .map((word) => {
        // Capitalize the word
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('') + 'Component';

  // Generate module names for each directory level
  const moduleNames = dirParts.map((part) => {
    console.log('Generating module name part:', part);
    return part
      .split('-')
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  });

  // Generate selector from the file name and adjust for hyphens before digits
  let selectorBase = componentName;
  // Remove hyphens before digits
  selectorBase = selectorBase.replace(/-(?=\d)/g, '');

  // Ensure selector does not start with a digit
  if (/^\d/.test(selectorBase)) {
    selectorBase = 'ngx-' + selectorBase;
  }

  const selector = 'app-' + selectorBase;

  console.log(`Generated componentPath: ${componentPath}`);
  console.log(`Generated componentName: ${componentName}`);
  console.log(`Generated componentClassName: ${componentClassName}`);
  console.log(`Generated selector: ${selector}`);
  console.log(`Generated moduleNames: ${moduleNames}`);

  return { componentPath, componentName, componentClassName, selector, moduleNames, originalDirParts, dirParts };
}

/**
 * Recursively scans the base directory and collects all .txt files.
 * @param {string} dir - The directory to scan.
 * @param {string[]} [fileList=[]] - The accumulator for file paths.
 * @returns {string[]} - An array of .txt file paths.
 */
function getAllTxtFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return fileList;
  }

  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllTxtFiles(fullPath, fileList);
    } else if (stat.isFile() && path.extname(fullPath) === '.txt') {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

/**
 * Processes each text file in the base directory to generate components and modules.
 */
async function processTxtFiles() {
  const txtFiles = getAllTxtFiles(baseDir);

  if (txtFiles.length === 0) {
    console.warn(`No .txt files found in directory: ${baseDir}`);
    return;
  }

  for (const filePath of txtFiles) {
    const snippetContent = fs.readFileSync(filePath, 'utf-8');

    const relativePath = path.relative(baseDir, filePath);
    const relativeDir = path.dirname(relativePath);

    const originalDirParts = relativeDir.split(path.sep).map(decodeURIComponent);

    const fileName = path.basename(filePath);

    console.log(`\nProcessing file: ${filePath}`);
    console.log(`Relative path: ${relativePath}`);
    console.log(`Relative directory: ${relativeDir}`);
    console.log(`Original directory parts: ${originalDirParts}`);

    const {
      componentPath,
      componentName,
      componentClassName,
      selector,
      moduleNames,
      originalDirParts: origDirParts,
      dirParts
    } = generateComponentData(relativeDir, fileName, originalDirParts);

    try {
      await generateComponentAndModule(
        componentPath,
        componentName,
        componentClassName,
        selector,
        snippetContent,
        moduleNames,
        origDirParts,
        dirParts
      );
    } catch (error) {
      console.error(`Failed to generate component for ${filePath}: ${error.message}`);
    }
  }
}

/**
 * Generates the component, updates the module, and creates a Storybook story.
 * @param {string} componentPath - The path to the component.
 * @param {string} componentName - The name of the component.
 * @param {string} componentClassName - The class name of the component.
 * @param {string} selector - The selector for the component.
 * @param {string} htmlContent - The HTML content for the component's template.
 * @param {string[]} moduleNames - The names of the modules.
 * @param {string[]} originalDirParts - The original directory parts.
 * @param {string[]} dirParts - The sanitized directory parts.
 */
async function generateComponentAndModule(
  componentPath,
  componentName,
  componentClassName,
  selector,
  htmlContent,
  moduleNames,
  originalDirParts,
  dirParts
) {
  try {
    // Generate the module hierarchy first
    await generateModuleHierarchy(componentPath, moduleNames, dirParts);

    // Generate the Angular component using Angular CLI with --force
    const generateCmd = `ng generate component ${componentPath} --module=${componentPath} --export --flat=false --skip-tests --selector=${selector} --force`;
    console.log(`Executing: ${generateCmd}`);
    execSync(generateCmd, { stdio: 'inherit' });

    // Paths to the generated component files
    const componentDir = path.join('src', 'app', componentPath);
    const templatePath = path.join(componentDir, `${componentName}.component.html`);
    const componentTsPath = path.join(componentDir, `${componentName}.component.ts`);

    // Replace the component's template with the HTML snippet
    fs.writeFileSync(templatePath, htmlContent);
    console.log(`Updated template for ${componentClassName}`);

    // Update the component class name in the component.ts file
    let componentTsContent = fs.readFileSync(componentTsPath, 'utf-8');
    componentTsContent = componentTsContent.replace(
      /export class [^\s{]*/,
      `export class ${componentClassName}`
    );
    fs.writeFileSync(componentTsPath, componentTsContent);
    console.log(`Updated component class name for ${componentClassName}`);

    // Determine the parent module's name and path
    if (moduleNames.length < 1 || dirParts.length < 1) {
      console.warn(`Insufficient module names or directory parts for component ${componentClassName}. Skipping Storybook story creation.`);
      return;
    }

    const parentModuleName = moduleNames[moduleNames.length - 1] + 'Module';
    const parentModuleDirParts = dirParts.slice(0, moduleNames.length);
    const parentModuleDir = path.join(...parentModuleDirParts);
    const parentModuleFileName = `${sanitizeName(dirParts[moduleNames.length - 1])}.module.ts`;
    const parentModulePath = path.join('src', 'app', parentModuleDir, parentModuleFileName);

    console.log(`Parent Module Path: ${parentModulePath}`);

    if (!fs.existsSync(parentModulePath)) {
      throw new Error(`Parent module file does not exist at path: ${parentModulePath}`);
    }

    // Compute the relative path from the component directory to the parent module
    let relativeImportPath = path.relative(componentDir, parentModulePath).replace(/\\/g, '/');

    if (!relativeImportPath.startsWith('.')) {
      relativeImportPath = './' + relativeImportPath;
    }

    relativeImportPath = relativeImportPath.replace(/\.ts$/, '');

    // Create a Storybook story for the component
    const title = originalDirParts.concat([componentName.replace(/-/g, ' ')]).map(toTitleCase).join(' / ');

    const storyContent = `import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ${componentClassName} } from './${componentName}.component';
import { ${parentModuleName} } from '${relativeImportPath}';

const meta: Meta<${componentClassName}> = {
  title: '${title}',
  component: ${componentClassName},
  decorators: [
    moduleMetadata({
      imports: [CommonModule, ${parentModuleName}],
    }),
  ],
};
export default meta;

type Story = StoryObj<${componentClassName}>;

export const Default: Story = {
  args: {},
};
`;

    // Write the Storybook story file
    const storyPath = path.join(componentDir, `${componentName}.stories.ts`);
    fs.writeFileSync(storyPath, storyContent);
    console.log(`Storybook story generated for ${componentClassName}`);
  } catch (error) {
    console.error(`Error generating component and module for ${componentName}: ${error.message}`);
    throw error; // Re-throw the error to be caught by the outer try-catch
  }
}

/**
 * Generates the module hierarchy by creating necessary modules and setting up imports.
 * This function processes only the directories that correspond to modules, excluding the component directory.
 * @param {string} componentPath - The path to the component.
 * @param {string[]} moduleNames - The names of the modules.
 * @param {string[]} dirParts - The sanitized directory parts.
 */
async function generateModuleHierarchy(componentPath, moduleNames, dirParts) {
  const moduleDirParts = componentPath.split(path.sep);
  let accumulatedPath = '';
  let previousModuleName = null;
  let previousModuleDirName = null; // Keep track of the parent module directory name

  // **Key Change:** Iterate only up to the parent of the component directory
  for (let i = 0; i < moduleDirParts.length - 1; i++) {
    accumulatedPath = path.join(accumulatedPath, moduleDirParts[i]);

    const sanitizedModuleDirName = sanitizeName(moduleDirParts[i]); // Preserves hyphens
    const currentModuleName = moduleNames[i] ? moduleNames[i] + 'Module' : null;
    const moduleFileName = moduleNames[i] ? `${sanitizeName(dirParts[i])}.module.ts` : '.module.ts';
    const moduleFilePath = path.join('src', 'app', accumulatedPath, moduleFileName);

    console.log(`\nGenerating module: ${currentModuleName || 'undefinedModule'} at path: ${moduleFilePath}`);

    if (!currentModuleName) {
      console.error(`moduleNames[${i}] is undefined for moduleDirParts[i]: ${moduleDirParts[i]}. Skipping module creation.`);
      continue;
    }

    // Check if the module file exists; if not, generate it synchronously
    if (!fs.existsSync(moduleFilePath)) {
      // Generate the module
      try {
        generateModuleSync(accumulatedPath);
      } catch (error) {
        console.error(`Failed to generate module ${currentModuleName}: ${error.message}`);
        throw error; // Re-throw the error to be caught by the outer try-catch
      }
    } else {
      console.log(`Module ${currentModuleName} already exists at path: ${moduleFilePath}`);
    }

    // Update the module to import parent modules
    if (previousModuleName && previousModuleDirName) {
      console.log(`Updating module ${currentModuleName} to import ${previousModuleName}`);
      updateModuleContent(
        moduleFilePath,
        currentModuleName,
        previousModuleName,
        previousModuleDirName
      );
    }

    // Update previous module information for the next iteration
    previousModuleName = currentModuleName;
    previousModuleDirName = path.join('src', 'app', moduleDirParts.slice(0, i + 1).join(path.sep));
  }
}

/**
 * Generates a module synchronously using Angular CLI.
 * @param {string} modulePath - The path to the module.
 */
function generateModuleSync(modulePath) {
  const generateCmd = `ng generate module ${modulePath} --flat=false --force`;
  console.log(`Executing: ${generateCmd}`);
  try {
    execSync(generateCmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute command "${generateCmd}": ${error.message}`);
    throw error;
  }
}

/**
 * Updates the module file to import the parent module.
 * @param {string} moduleFilePath - The file path of the module to update.
 * @param {string} moduleName - The name of the current module.
 * @param {string} parentModuleName - The name of the parent module to import.
 * @param {string} parentModuleDirName - The directory path of the parent module.
 */
function updateModuleContent(
  moduleFilePath,
  moduleName,
  parentModuleName,
  parentModuleDirName
) {
  let moduleContent;
  try {
    moduleContent = fs.readFileSync(moduleFilePath, 'utf-8');
  } catch (err) {
    console.error(`Failed to read module file at ${moduleFilePath}: ${err.message}`);
    return;
  }

  if (!moduleName) {
    console.error(`moduleName is undefined for moduleFilePath: ${moduleFilePath}`);
    return;
  }

  if (!parentModuleName || !parentModuleDirName) {
    console.error(`Parent module name or directory is undefined for module ${moduleName}`);
    return;
  }

  // Construct the parent module import path using camelCaseToKebabCase
  const parentModuleSanitizedName = camelCaseToKebabCase(parentModuleName.replace('Module', ''));
  let parentModuleImportPath = path.relative(
    path.dirname(moduleFilePath),
    path.join(parentModuleDirName, `${parentModuleSanitizedName}.module`)
  ).replace(/\\/g, '/'); // Replace backslashes with forward slashes

  // Ensure the path starts with './' or '../'
  if (!parentModuleImportPath.startsWith('.')) {
    parentModuleImportPath = './' + parentModuleImportPath;
  }

  // Remove the file extension
  parentModuleImportPath = parentModuleImportPath.replace(/\.ts$/, '');

  console.log(`Importing ${parentModuleName} from ${parentModuleImportPath} into ${moduleName}`);

  // Add the import statement at the top if not already present
  const importStatement = `import { ${parentModuleName} } from '${parentModuleImportPath}';\n`;
  if (!moduleContent.includes(importStatement)) {
    moduleContent = importStatement + moduleContent;
    console.log(`Added import statement for ${parentModuleName} in ${moduleName}`);
  } else {
    console.log(`${parentModuleName} is already imported in ${moduleName}`);
  }

  // Add the parent module to the imports array if not already present
  const importsRegex = /imports:\s*\[([^\]]*)\]/s;
  const match = moduleContent.match(importsRegex);
  if (match) {
    let importsContent = match[1];
    const imports = importsContent.split(',').map(i => i.trim()).filter(i => i);
    if (!imports.includes(parentModuleName)) {
      imports.push(parentModuleName);
      const newImports = `imports: [\n    ${imports.join(',\n    ')}\n  ]`;
      moduleContent = moduleContent.replace(importsRegex, newImports);
      console.log(`Added ${parentModuleName} to imports array in ${moduleName}`);
    } else {
      console.log(`${parentModuleName} is already in imports array of ${moduleName}`);
    }
  } else {
    console.error(`Could not find imports array in ${moduleFilePath}. Manual intervention may be required.`);
  }

  // Write the updated module content back to the file
  try {
    fs.writeFileSync(moduleFilePath, moduleContent);
    console.log(`Updated module file: ${moduleFilePath}`);
  } catch (err) {
    console.error(`Failed to write updated module file at ${moduleFilePath}: ${err.message}`);
  }
}

/**
 * Converts CamelCase to kebab-case
 * @param {string} str - The CamelCase string
 * @returns {string} - The kebab-case string
 */
function camelCaseToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Start the script
(async () => {
  try {
    await processTxtFiles();
    console.log('\nAll components, modules, and stories have been generated.');
  } catch (err) {
    console.error('An error occurred:', err);
  }
})();

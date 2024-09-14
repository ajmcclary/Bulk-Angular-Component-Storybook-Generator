
# Bulk Angular Component & Storybook Generator

I built the **Bulk Angular Component & Storybook Generator** to solve a problem I faced time and again.

As a developer, I frequently found myself grabbing HTML snippets from CSS libraries like Tailwind to quickly create UI components. But every time I did, I ended up investing a lot of time setting them up in Angular—creating modules, organizing files into the right directory structure, and configuring each component in Storybook. It was a tedious process that got in the way of my actual development work.

I wanted to streamline this workflow. I imagined a tool that could not only transform my HTML snippets into Angular components but also automatically set up the associated modules and Storybook stories.

That’s where this generator comes in. Now, I can take a snippet like "Constrained Padded," drop it into the right folder, and with a single command, have it automatically turned into a fully functional Angular component.

The best part? It’s already integrated with Storybook, so I can visualize and test it immediately. This tool has been a game-changer for me, saving me hours of repetitive work and allowing me to focus on building beautiful, functional UIs.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Directory Structure](#directory-structure)
- [Naming Conventions](#naming-conventions)
- [Usage](#usage)
    - [Running the Script](#running-the-script)
    - [Command-Line Arguments](#command-line-arguments)
    - [Examples](#examples)
    - [Best Practices](#best-practices)
- [Output](#output)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)

---

## Overview

The **Bulk Angular Component & Storybook Generator** script is a powerful tool designed to automate the creation of Angular components, modules, and corresponding Storybook stories based on structured text files. By leveraging a predefined directory structure and naming conventions, this script streamlines the development workflow, ensuring consistency and efficiency in large-scale Angular projects.

### Key Features

- **Automated Component Creation:** Generates Angular components from `.txt` template files.
- **Module Hierarchy Generation:** Creates and maintains the necessary Angular modules based on directory structures.
- **Storybook Integration:** Automatically generates Storybook stories for each component, facilitating seamless UI development and testing.
- **Custom Naming Conventions:** Supports complex naming patterns, including handling hyphens and numerical patterns within names.
- **Robust Error Handling:** Implements comprehensive logging and error detection to aid in debugging and maintenance.

---

## Prerequisites

Before using the **Bulk Generate Components** script, ensure that your development environment meets the following requirements:

1. **Node.js:**
    - **Version:** v12.x or higher
    - **Installation:** [Download Node.js](https://nodejs.org/en/download/)

2. **Angular CLI:**
    - **Version:** Compatible with your Angular project (e.g., v12.x, v13.x)
    - **Installation:**
      ```bash
      npm install -g @angular/cli
      ```

3. **Storybook:**
    - **Version:** Compatible with your Angular project (e.g., v6.x or later)
    - **Installation:**  
      To integrate Storybook with Angular, run:
      ```bash
      npx sb init --type angular
      ```
    - **Dependencies:** Ensure that your project has `@storybook/angular` and `@storybook/addons` installed. These should be added automatically when running the command above.

4. **Git (Optional):**
    - For version control and collaboration.
    - **Installation:** [Download Git](https://git-scm.com/downloads)

5. **Code Editor:**
    - Recommended: [Visual Studio Code](https://code.visualstudio.com/)


Before using the **Bulk Generate Components** script, ensure that your development environment meets the following requirements:

1. **Node.js:**
    - **Version:** v12.x or higher
    - **Installation:** [Download Node.js](https://nodejs.org/en/download/)

2. **Angular CLI:**
    - **Version:** Compatible with your Angular project (e.g., v12.x, v13.x)
    - **Installation:**
      ```bash
      npm install -g @angular/cli
      ```

3. **Git (Optional):**
    - For version control and collaboration.
    - **Installation:** [Download Git](https://git-scm.com/downloads)

4. **Code Editor:**
    - Recommended: [Visual Studio Code](https://code.visualstudio.com/)

---

## Installation

Follow these steps to set up the **Bulk Generate Components** script in your Angular project:

1. **Clone Your Angular Project (If Not Already Cloned):**

   ```bash
   git clone https://github.com/your-username/your-angular-project.git
   cd your-angular-project
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd your-angular-project
   ```

3. **Install Necessary Dependencies:**

   Ensure that all project dependencies are installed.

   ```bash
   npm install
   ```

4. **Add the Script to Your Project:**

   Create a `scripts` directory (if it doesn't exist) and add the `bulk-generate-components.js` script.

   ```bash
   mkdir -p scripts
   touch scripts/bulk-generate-components.js
   ```

   Copy and paste the provided `bulk-generate-components.js` script into this file.

5. **Make the Script Executable (Optional):**

   If you're on a Unix-based system, you can make the script executable.

   ```bash
   chmod +x scripts/bulk-generate-components.js
   ```

6. **Install Additional Dependencies:**

   The script relies on Node.js built-in modules (`fs`, `path`, `child_process`), so no additional npm packages are required. However, ensure that Angular CLI is installed globally as per the prerequisites.

---

## Directory Structure

The script interprets a specific directory structure to generate Angular components and modules. Organize your template `.txt` files within the `Templates/Snippets` directory following this hierarchy:

```
Templates/
  Snippets/
    Marketing/
      Page Sections/
        Pricing Sections/
          pricing-sections.txt
        Stats/
          stats.txt
        Team Sections/
          team-sections.txt
        Testimonials/
          testimonials.txt
    Application UI/
      Headings/
        Section Headings/
          with-tabs.txt
      Navigation/
        Tabs/
          tabs-with-underline-and-icons.txt
    ...
```

### Explanation

- **Templates/Snippets:**  
  The root directory containing all your component templates.

- **Marketing, Application UI, Layout, Ecommerce, etc.:**  
  Top-level categories representing different sections or features of your application.

- **Subdirectories (e.g., Page Sections, Headings):**  
  Further categorization to organize components logically.

- **`.txt` Files (e.g., pricing-sections.txt):**  
  Each `.txt` file contains the HTML snippet or template content for the corresponding component.

---

## Naming Conventions

Consistent naming is crucial for the script to function correctly. Adhere to the following conventions to prevent errors, especially those related to module imports.

### Module and Component Names

1. **Hyphens Preservation:**

    - **Modules:** Use kebab-case (e.g., `page-sections.module.ts`).
    - **Components:** Use kebab-case for filenames (e.g., `pricing-sections.component.ts`) and CamelCase for class names (e.g., `PricingSectionsComponent`).

2. **Directory Names:**

    - Should match the intended module and component names, using spaces or hyphens as needed.
    - Example:  
      `Page Sections/` contains `page-sections.module.ts` and `pricing-sections.component.ts`.

3. **Selectors:**

    - Use the `app-` prefix followed by the component name in kebab-case.
    - Example:  
      `<app-pricing-sections></app-pricing-sections>`

4. **Handling Numerical Patterns:**

    - Convert numerical patterns (e.g., `2x2`) to words (e.g., `twobytwo`) to ensure valid naming.
    - Example:  
      `2x2 Layout` becomes `twobytwo-layout.module.ts`.

### Example

- **File Path:**  
  `Templates/Snippets/Marketing/Page Sections/Pricing Sections/pricing-sections.txt`

- **Generated Component:**
    - **Class Name:** `PricingSectionsComponent`
    - **Selector:** `app-pricing-sections`
    - **Module Name:** `PageSectionsModule`
    - **Module Import Path:** `'../page-sections.module'`

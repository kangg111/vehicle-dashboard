# Vehicle Management Dashboard

## Project Overview

The Vehicle Management Dashboard is a React-based web application for managing vehicles, displaying vehicle data, and filtering based on various criteria. It provides a user-friendly interface with search, filtering, and sorting functionalities.

## Technologies Used

- `React.js`: Core library for building the user interface.

- `TypeScript`: Used for type safety and better development experience.
- `Tailwind CSS`: Utility-first CSS framework for rapid UI development.
- `Ant Design`: UI component library for rich and responsive components.
- `Moment.js`: Library for handling and formatting dates.
- `Day.js`: A lightweight alternative to Moment.js for date formatting.

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or later)
- npm or yarn

### 1. Installation Steps

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies:

```bash
npm install
```

### 3.Configure Tailwind CSS:

- Ensure the Tailwind configuration file (`tailwind.config.js`) is present.

- Ensure `postcss.config.js` is properly set up for Tailwind processing.

### 4.Start the development server:

```bash
npm start
```

### 5.Open the application in your browse:

```bash
http://localhost:3000
```

## Project Structure

```bash
├── src
│   ├── components   # Reusable components
│   ├── pages        # Page components (Dashboard, etc.)
│   ├── styles       # Tailwind and global styles
│   ├── utils        # Helper functions and utilities
│   ├── index.tsx    # Application entry point
│   └── App.tsx      # Main application component
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── package.json        # Dependencies and scripts
└── README.md           # Documentation
```

## Features

- View and manage vehicles
- Search by license plate
- Filter by approval status, vehicle status, date range, etc.
- Responsive UI using Ant Design
- Data fetching with API integration

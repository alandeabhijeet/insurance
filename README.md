# Insurance Management System

## Overview

The Insurance Management System is a web-based application designed to streamline and manage various aspects of an insurance company's operations. This system allows different users such as customers, HR personnel, finance staff, inspectors, and agents to interact with the system based on their roles, enabling efficient handling of insurance-related processes.

## Features

- **Role-Based Access**: Different login options for customers, HR, finance, inspectors, and agents, each with tailored functionalities.
- **Database Management**: Efficiently store and manage insurance policies, customer information, claims, and other critical data using MySQL.
- **Dynamic Web Pages**: Generate HTML dynamically using EJS templates for a seamless user experience.
- **Data Security**: Secure management of user credentials and sensitive information.
- **Procedural Operations**: Execute predefined SQL procedures to automate tasks within the system.

## Technology

This project is built using the following technologies:

- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine, used for server-side scripting.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **MySQL**: A relational database management system used to store and manage data.
- **EJS (Embedded JavaScript)**: A simple templating language that lets you generate HTML markup with plain JavaScript.
- **JavaScript**: The primary programming language used for both server-side and client-side logic.
- **HTML/CSS**: For building the frontend user interface.

## How It Works

### Setup

1. Update the MySQL password to `22bcs007`.
2. Execute the SQL scripts located in the `sql` folder in the following order:
   - `Table.sql` - Creates the necessary tables.
   - `Key.sql` - Sets up primary and foreign keys.
   - `Data.sql` - Inserts initial data into the tables.
   - `procedure.sql` - Sets up stored procedures for complex operations.

### User Interaction

- Users log in with role-specific credentials provided below:
  - **Customer login**: `C 123`
  - **HR login**: `H 123`
  - **Finance login**: `F 123`
  - **Inspector login**: `I 123`
  - **Agent login**: `A 123`
- Depending on the role, the system provides different functionalities tailored to the user’s needs.

### Processing

- The application processes requests on the server side using Node.js and Express.js.
- MySQL handles data storage and retrieval, ensuring that all operations are executed efficiently.
- EJS templates render dynamic content, ensuring that the frontend remains responsive and interactive.

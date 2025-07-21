# EECMS Coordinator Coordination

It is a web application for managing and coordinating course coordinators of Electrical Engineering, Computing and Mathematical Sciences (EECMS), Curtin University. The application acts as a guide for staff to quickly find, communicate, and leave manage with coordinators. It also helps coordinators quickly find deputies to take away some load.

## Table of Contents

- [EECMS Coordinator Coordination](#eecms-coordinator-coordination)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Scripts](#scripts)
  - [Technologies Used](#technologies-used)
  - [Testing](#testing)
  - [License](#license)

## Features

- Admin and Coordinator Interfaces for managing courses, coordinators, and leave requests.
- Staff access to search and contact course coordinators.
- Real-time notifications for changes and updates.
- Role management for admins to assign and manage system roles.

## Installation

1. **Clone the repository**:
   - Click the Clone button located in the top right corner of the repository page.
   - Copy the provided URL.
   - Open your terminal and run the following command (replace your-repo-url with the copied URL):

   ```bash
   git clone your-repo-url
   ```
2. **Navigate to the project directory**:

   ```bash
   cd eecms-coordinator-coordination
   ```

3. **Install dependencies for the backend**:

   ```bash
   npm install
   ```

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

   ```bash
   MONGO_URI=mongodb://localhost:27017/your-database-name
   PORT=5000
   NODE_ENV=development
   ```
   
## Scripts
- `npm test`: Runs all backend tests using Jest and provides coverage reports.
- `npm run backend-test`: Runs the backend tests using Jest.

## Technologies Used

- **Frontend**: (Removed from this version)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JSON Web Tokens (JWT)
- **Testing**: Jest

## Testing
Testing is set up using Jest for the backend. You can run the tests using the following command:

   ```bash
   npm run backend-test
   ```

Make sure your environment variables are set correctly when running tests. Tests are located in the backend/tests/ directory and cover key functionalities of the controllers, models, and middlewares.

## License
MIT License

Copyright (c) 2024 Izzul Hakeem, Zitong Meng, Jaron Quy Rose, Yuyang Gao, You Lyu

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

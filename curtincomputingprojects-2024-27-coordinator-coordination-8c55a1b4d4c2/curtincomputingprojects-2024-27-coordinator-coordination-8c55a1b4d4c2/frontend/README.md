# EECMS Coordinator Coordination – Frontend by Izzul Hakeem Bin Zulkapeli and Zitong Meng

This is the frontend interface for the EECMS Coordinator Coordination system. It is built using React.js and connects to the backend and middleware components via RESTful API.

## Folder Structure

```
/src
│
├── /components     # Reusable parts of the user interface
├── /pages          # Main interactable screens which contain components and assets
├── /assets         # Static elements like images and logos)
└── App.js          # Main React component and routing
```

## Technologies Used

- React.js
- JavaScript (ES6)
- HTML & CSS
- npm (Node Package Manager)

## Setup

### 1. Install dependencies
```bash
npm install
npm install react-router-dom
npm install axios
npm install react-datepicker
npm install date-fns
```

### 2. Run the development server
```bash
npm start
```

The app will run on `http://localhost:3000/`

### 3. Mock Test User
For Test Coordinator Page plz use this account, Password can be anything, but must type.
```bash
coordinator1@example.com
```

For Test Admin Page plz use this account, Password can be anything, but must type.
```bash
admin1@example.com
```

## API Connection

This frontend communicates with the backend via REST APIs. Update the `.env` file with your API base URL:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Testing

Frontend unit testing and UI validation will be performed using tools such as:

- React Testing Library
- Jest

## Notes

- This branch is only for frontend development.
- For backend and other components, see the respective branches (`backend`, `middleware`, `database`).

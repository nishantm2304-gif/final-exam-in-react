# Scholar Student Management

A beginner-friendly React student management app. It uses React state and `fetch` for the interface and JSON Server for saving student records. Bootstrap is used for form controls and buttons. The app intentionally does not use Redux or React Router.

## Run the app

Install dependencies once:

```bash
npm install
```

Start the API in one terminal:

```bash
npm run server
```

Start the React app in another terminal:

```bash
npm run dev
```

Open the local address printed by Vite. JSON Server runs at `http://localhost:3001` and stores data in `db.json`.

## Demo sign in

- Email: `admin@school.com`
- Password: `admin123`

This is a front-end demonstration login, not production authentication. It stores the signed-in flag in the current browser session.

## Features

- View, search, sort, and filter students
- Add, edit, and delete student records
- Save student details through JSON Server (`/students`)
- Dashboard counts and a simple profile page
- Responsive layout with Bootstrap styling

Student records include name, phone, email, age, class, grade, and an optional image URL.

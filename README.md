# Todo App — Backend

A simple REST API for a full-stack Todo application.

This repository contains the backend/server application. The frontend is maintained separately in the `todo_app_frontend` repository.

The project is designed to practice **backend development, API design, database integration, and cloud deployment**.

## Features

* Create todos
* Get todos
* Update todos
* Mark todos as completed
* Delete todos
* REST API endpoints
* Database integration
* Environment-based configuration
* Production-ready API deployment

## Tech Stack

* **Runtime:** Node.js
* **Backend:** Express.js
* **Database:** `<DATABASE>`
* **API Style:** REST
* **Deployment:** Cloud hosting platform

> Replace `<DATABASE>` with the database you actually use, such as PostgreSQL, MongoDB, MySQL, or SQLite.

## Project Structure

```text
todo_app_backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.*
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <BACKEND_REPOSITORY_URL>
cd todo_app_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000
DATABASE_URL=<YOUR_DATABASE_URL>
```

Add any additional environment variables required by your application.

> Never commit `.env` files or database credentials to Git.

### 4. Start the development server

```bash
npm run dev
```

Or, if the project does not have a development script:

```bash
npm start
```

The API should be available at:

```text
http://localhost:5000
```

## API Endpoints

The API provides the following basic Todo operations:

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/api/todos`     | Get all todos       |
| GET    | `/api/todos/:id` | Get a specific todo |
| POST   | `/api/todos`     | Create a todo       |
| PUT    | `/api/todos/:id` | Update a todo       |
| DELETE | `/api/todos/:id` | Delete a todo       |

### Example Todo

```json
{
  "id": 1,
  "title": "Learn cloud deployment",
  "completed": false
}
```

### Create a Todo

```http
POST /api/todos
Content-Type: application/json
```

Request body:

```json
{
  "title": "Learn backend deployment"
}
```

### Update a Todo

```http
PUT /api/todos/1
Content-Type: application/json
```

Request body:

```json
{
  "title": "Learn backend deployment",
  "completed": true
}
```

## CORS

The backend needs to allow requests from the deployed frontend.

During local development, the frontend may run on:

```text
http://localhost:5173
```

After deployment, configure CORS to allow the production frontend domain.

Example:

```text
Frontend:
https://your-frontend-domain.com

Backend:
https://your-backend-domain.com
```

## Frontend

The frontend for this API is maintained separately:

```text
todo_app_frontend
```

The frontend should use the deployed backend URL as its API base URL.

Example:

```env
VITE_API_URL=https://your-backend-domain.com
```

## Deployment

The backend can be deployed to services such as:

* Render
* Railway
* Fly.io
* AWS
* Google Cloud
* Azure
* Any platform that supports Node.js applications

Before deploying, configure the required environment variables on the cloud platform.

Example:

```env
PORT=5000
DATABASE_URL=<YOUR_PRODUCTION_DATABASE_URL>
```

The backend should listen on the port provided by the hosting platform when required.

## Production Checklist

* [ ] Configure production environment variables
* [ ] Configure the production database
* [ ] Configure CORS for the frontend domain
* [ ] Make sure secrets are not committed to Git
* [ ] Test all API endpoints
* [ ] Deploy the backend
* [ ] Update the frontend API URL
* [ ] Test the complete frontend-to-backend flow

## Development Goals

This project is primarily intended as a practice project for learning:

* Node.js backend development
* REST API design
* Database integration
* Environment variables
* CORS
* Git and GitHub workflows
* Backend cloud deployment
* Connecting a deployed backend with a deployed frontend

## License

This project is for learning and practice purposes.

-------------------------------------------

**List Endpoints (`/api/v1/lists`)**

* **`POST /api/v1/lists`** — Create a new custom list (`title`, `color`).
* **`GET /api/v1/lists`** — Retrieve all non-archived lists owned by the logged-in user (with query param `?archived=true` for archived lists).
* **`GET /api/v1/lists/:id`** — Retrieve details for a single list.
* **`PATCH /api/v1/lists/:id`** — Update list attributes (`title`, `color`, `isArchived`).
* **`DELETE /api/v1/lists/:id`** — Delete a list and cascade-delete all nested tasks.

---

**Task Endpoints (`/api/v1/tasks` & `/api/v1/lists/:listId/tasks`)**

| Method | Route | Description |
| --- | --- | --- |
| **POST** | `/api/v1/lists/:listId/tasks` | Create a task inside a specific list |
| **GET** | `/api/v1/lists/:listId/tasks` | Get all tasks for a list (sorted by `order`) |
| **PATCH** | `/api/v1/tasks/:id` | Update task details (`title`, `description`, `isCompleted`, `dueDate`) |
| **PATCH** | `/api/v1/lists/:listId/tasks/reorder` | Bulk update task positions after drag-and-drop sorting |
| **DELETE** | `/api/v1/tasks/:id` | Delete a single task |

---

**Key Business Logic Behaviors**

* **List Ownership Verification:** Since `Task` does not store `user`, every task endpoint must check if the parent `list` belongs to `req.user._id` before reading or modifying tasks.
* **Auto-Incrementing `order`:** When creating a task inside a list, default its `order` value to `highestExistingOrder + 1`.
* **Cascading Delete:** Deleting a list invokes `Task.deleteMany({ list: listId })` so no orphan tasks remain in the database.

Which section should we implement first: the **List controller/routes** or the **Task controller/routes**?

POST /api/v1/lists
GET /api/v1/lists
GET /api/v1/lists/:id
PATCH /api/v1/lists/:id
DELETE /api/v1/lists/:id

POST /api/v1/lists/:id/tasks
GET /api/v1/lists/:id/tasks
PATCH /api/v1/tasks/:id
PATCH /api/v1/lists/:id/tasks/reorder
DELETE /api/v1/tasks/:id

/api/v1
    /lists 
        / GET
        / POST
            /:id GET
            /:id PATCH
            /:id DELETE
                /tasks GET   
                /tasks POST   
                    /reorder PATCH
    /tasks
        /:id PATCH
        /:id DELETE

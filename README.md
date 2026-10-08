# Todo App

A full-stack todo application with an Angular web client and an ASP.NET Core Web API. The API supports user registration and login, JWT-protected todo list operations, and user profile management.

## Tech stack

### Web

- Angular 22
- NgRx Store and Effects for todo state and API side effects
- RxJS for asynchronous data flows
- Angular SSR and client hydration
- SCSS
- Vitest for unit tests

### API

- ASP.NET Core Minimal APIs on .NET 10
- Entity Framework Core with an in-memory database
- MediatR for request handling and vertical feature slices
- FluentValidation for request validation
- JWT bearer authentication and BCrypt password hashing
- xUnit and `Microsoft.AspNetCore.Mvc.Testing` for API tests

## Project structure

```text
.
├── TodoApp.Api/                 # ASP.NET Core API
│   ├── Common/                  # Shared validation and exception handling
│   ├── Domain/                  # User and todo entities
│   ├── Features/                # User and todo endpoints, commands, and handlers
│   ├── Infrastructure/          # EF Core context, JWT, and user context
│   ├── Program.cs               # Dependency registration and middleware
│   └── appsettings*.json        # API configuration
├── TodoApp.Api.Test/            # API integration tests
└── TodoApp.Web/                 # Angular web application
    └── src/app/
        ├── core/                # API base URL, authentication, and app setup
        ├── feature/Auth/        # Login, registration, and profile pages
        └── feature/TodoList/    # Todo pages, API service, models, and state
```

## Requirements

- .NET 10 SDK
- Node.js and npm versions compatible with Angular 22

## Run locally

Run the API and web app in separate terminals from the repository root.

### 1. Start the API

```powershell
cd TodoApp.Api
dotnet run
```

The development launch profile serves the API at `http://localhost:5098`. The web client is configured to use that address. The API's development JWT settings are supplied by its configuration files

### 2. Start the web app

```powershell
cd TodoApp.Web
npm ci
npm start
```

Open `http://localhost:4200`.   

### Data storage

The API uses EF Core's in-memory provider (`TodoDb`), so data is held in memory and is not persisted.

## Tests

Run API integration tests from the repository root:

```powershell
dotnet test TodoApp.Api.Test/TodoApp.Api.Test.csproj
```

Run web unit tests:

```powershell
cd TodoApp.Web
npm test
```

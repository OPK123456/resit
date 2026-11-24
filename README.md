# 🎓 School Resit Registration System

A web-based School Resit Registration System designed to simplify and automate the process of managing student resit registrations, academic results, payments and administrative activities.

The system provides a convenient platform where students can activate their accounts, log in, view their resit eligibility, register for resit courses, make payments and access their payment receipts. Administrators can manage students, courses, academic results, resit periods and payment records from a centralized dashboard.

## 🚀 Project Overview

The School Resit Registration System aims to reduce the manual work involved in organizing resit examinations and improve accuracy, efficiency and transparency in the registration process.

It provides separate interfaces for students and administrators, ensuring that each user has access to the appropriate features and information.

## ✨ Key Features

### 👨‍🎓 Student Portal
- Student account activation using activation codes.
- Account activation through manually issued codes or school email.
- Secure student login and authentication.
- View available resit periods.
- Check resit eligibility based on academic results.
- Register for eligible resit courses.
- View registration history.
- Make resit payments.
- View and access payment receipts.
- Receive system notifications.

### 🛠️ Administrator Dashboard
- Secure administrator authentication.
- View dashboard statistics.
- Register and manage students.
- Import student records.
- Manage courses.
- Import and manage academic results.
- Create and manage resit periods.
- Set resit fees for each course within a resit period.
- View and manage student registrations.
- Monitor student payments.
- Manage payment records and receipts.

### 📊 Academic Management
- Manage student academic records.
- Determine resit eligibility using examination results.
- Apply the school's 50% pass mark.
- Students scoring below 50% are considered to have failed.
- Students scoring 50% or above are considered to have passed.

## 🧰 Technologies Used

| Technology | Purpose |
|---|---|
| Laravel | Backend development |
| React.js | Frontend development |
| PostgreSQL | Database management |
| PHP | Server-side programming |
| JavaScript | Frontend functionality |
| CSS | User interface styling |
| Docker | Application containerization |
| REST API | Communication between frontend and backend |
| Laravel Sanctum | API authentication |

## 🏗️ System Architecture

The application uses a frontend and backend architecture.

- **Frontend:** React.js provides the user interface for students and administrators.
- **Backend:** Laravel handles application logic, authentication, registration, payments and academic records.
- **Database:** PostgreSQL stores student information, courses, results, registrations and payment records.
- **Docker:** Provides the containerized development environment.

## 📁 Project Structure

```text
school-resit-system/
│
├── backend/
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── resources/
│   ├── routes/
│   ├── tests/
│   └── composer.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## ⚙️ Installation and Setup

### Requirements

Make sure you have the following installed:

- Git
- Docker Desktop
- Node.js and npm

### 1. Clone the Repository

```bash
git clone https://github.com/OPK123456/resit.git
```

### 2. Enter the Project Folder

```bash
cd resit
```

### 3. Configure the Backend

Navigate into the backend folder:

```bash
cd backend
```

Create your environment file:

```bash
cp .env.example .env
```

Configure your database settings in the `.env` file according to your Docker configuration.

### 4. Start Docker

Return to the project root:

```bash
cd ..
```

Build and start the application:

```bash
docker compose up -d --build
```

### 5. Generate the Application Key

```bash
docker compose exec app php artisan key:generate
```

### 6. Run Database Migrations

```bash
docker compose exec app php artisan migrate
```

### 7. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

**Note:** The application ports, database configuration and service names should match your `docker-compose.yml` and `.env` files.

## 🔒 Security Features

- Secure user authentication.
- Password hashing.
- Separate student and administrator access.
- API authentication using Laravel Sanctum.
- Protected administrative routes.
- Role-based access control.

## 🎯 Project Objectives

1. Automate the school resit registration process.
2. Reduce manual administrative work.
3. Improve the accuracy of student resit eligibility checks.
4. Simplify resit payment management.
5. Provide students with easy access to their registration information.
6. Improve the management of academic records and resit periods.

## 🔮 Future Enhancements

- SMS and email notification integration.
- Advanced payment gateway integration.
- Automated examination timetable generation.
- Downloadable administrative reports.
- Improved analytics and reporting.
- Mobile application support.

## 👨‍💻 Developer

**Project:** School Resit Registration System

**Repository:** [GitHub – School Resit Registration System](https://github.com/OPK123456/resit)

## 📜 License

This project is developed for educational and institutional use. Licensing and distribution terms can be defined by the project owner.

---

### 🎓 Making Resit Registration Easier, Faster and More Efficient.

# 🌾 Farm2Table: A Dynamic Freshness-Based Farm-to-Consumer Marketplace

## 📋 Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [License](#license)

---

# 🎯 Overview

**Farm2Table** is a full-stack MERN application that connects local farmers directly with consumers, eliminating middlemen and ensuring transparency in freshness, pricing, and delivery.

The platform features a **dynamic pricing algorithm** that automatically adjusts produce prices based on harvest time, helping reduce food waste while providing consumers with the freshest produce at fair prices.

## 🌟 Key Highlights

- ⏰ Real-time Freshness Tracking
- 💰 Dynamic Pricing Algorithm
- 🚫 Zero Middlemen
- 📦 24-Hour Harvest Guarantee
- 🔔 Real-time Notifications using Socket.io
- 📊 Role-Based Dashboards for Farmers, Buyers, and Admins

---

# ❗ Problem Statement

> Small-scale farmers within 100km of a city have no digital platform to list daily harvest surplus, set dynamic pricing based on freshness, and coordinate just-in-time delivery.

Urban buyers cannot reliably source fresh, local produce at fair prices without visiting multiple markets or relying on aggregators who take high margins.

## Real-World Impact

- 🗑️ 20–30% of produce is wasted due to lack of direct market access.
- 💰 Farmers receive only around 70% of the market price because of intermediaries.
- 🥬 Most supermarket produce is already 5–10 days old.
- 🌍 Food waste contributes significantly to global greenhouse gas emissions.

---

# 💡 Solution

Farm2Table bridges the gap between farmers and consumers by providing:

- Direct farmer-to-consumer marketplace
- Harvest timestamp for every product
- Dynamic freshness-based pricing
- Real-time order tracking
- Fair pricing without middlemen
- Instant notifications for buyers and farmers

---

# 🚀 Key Features

## 👨‍🌾 Farmer Features

- Product Management
- Inventory Tracking
- Order Management
- Revenue Analytics
- Freshness Score Calculation
- Real-time Order Notifications

---

## 🛒 Buyer Features

- Browse Fresh Produce
- Search & Filter Products
- Add to Cart
- Secure Checkout
- Order History
- Live Order Tracking
- Freshness Score Display

---

## 👨‍💼 Admin Features

- User Management
- Listing Management
- Order Monitoring
- Platform Analytics Dashboard

---

## 🌐 Core Platform Features

- JWT Authentication
- Role-Based Authorization
- Dynamic Pricing Algorithm
- Freshness Score Calculation
- Socket.io Real-Time Communication
- Dashboard Analytics
- Mobile Responsive Design
- Geolocation Support

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React.js | User Interface |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| React Router DOM | Routing |
| Axios | API Communication |
| Socket.io Client | Real-time Updates |
| React Hot Toast | Notifications |
| Framer Motion | Animations |
| React Icons | Icons |

---

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcrypt.js | Password Hashing |
| Socket.io | Real-time Communication |
| Helmet | Security |
| CORS | Cross-Origin Requests |
| Morgan | Logging |

---

## Development Tools

- Git
- GitHub
- VS Code
- MongoDB Compass
- Postman
- Nodemon

---

# 🏗️ System Architecture

```
                    CLIENT (React.js)

                          │
                          ▼

                Express.js REST API Server

                          │
                          ▼

              Business Logic (Node.js)

                          │
                          ▼

                    MongoDB Database

                          │
                          ▼

           Socket.io Real-Time Communication
```

---

## Data Flow

### Authentication Flow

User

↓

Register/Login

↓

JWT Token

↓

Protected Routes

---

### Product Flow

Farmer

↓

Create Listing

↓

MongoDB

↓

Buyer Views Products

↓

Add to Cart

---

### Order Flow

Buyer

↓

Place Order

↓

Farmer Notification

↓

Accept/Reject

↓

Order Status Updated

---

### Notification Flow

Server

↓

Socket.io

↓

Buyer & Farmer Receive Instant Updates

---

# 📚 API Documentation

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register User |
| POST | `/api/v1/auth/login` | Login User |
| GET | `/api/v1/auth/me` | Current User |
| POST | `/api/v1/auth/logout` | Logout |
| POST | `/api/v1/auth/refresh-token` | Refresh Token |

---

## Product Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/listings/active` | Get Products |
| GET | `/api/v1/listings/:id` | Get Product |
| POST | `/api/v1/listings` | Add Product |
| GET | `/api/v1/listings/my-listings` | Farmer Listings |
| PUT | `/api/v1/listings/:id` | Update Listing |
| DELETE | `/api/v1/listings/:id` | Delete Listing |

---

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/orders` | Create Order |
| GET | `/api/v1/orders/my-orders` | Buyer Orders |
| GET | `/api/v1/orders/farmer/orders` | Farmer Orders |
| GET | `/api/v1/orders/:id` | Single Order |
| PUT | `/api/v1/orders/:id/status` | Update Status |
| PUT | `/api/v1/orders/:id/cancel` | Cancel Order |

---

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | Get Users |
| PUT | `/api/v1/admin/users/:id/status` | Update User |
| DELETE | `/api/v1/admin/users/:id` | Delete User |
| GET | `/api/v1/admin/listings` | All Listings |
| DELETE | `/api/v1/admin/listings/:id` | Delete Listing |
| GET | `/api/v1/admin/orders` | All Orders |
| GET | `/api/v1/admin/stats` | Dashboard Statistics |

---

# 🚀 Installation & Setup

## Prerequisites

- Node.js (v20+)
- MongoDB
- npm

---

## Clone Repository

```bash
git clone https://github.com/yourusername/Farm2Table.git

cd Farm2Table
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173
```

---

## Run the Application

### Backend

```bash
cd backend

npm run dev
```

### Frontend

```bash
cd frontend

npm run dev
```

The application will be available at

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:5000
```

---

# 🔮 Future Enhancements

- 📱 Mobile Application (React Native)
- 💳 Razorpay/Stripe Payment Integration
- 🚚 GPS-based Live Delivery Tracking
- 🤖 AI-based Product Recommendation
- 📦 Subscription-based Vegetable Boxes
- 🌐 Multi-language Support
- ⭐ Farmer Verification System
- 📊 Advanced Analytics Dashboard
- ⭐ Product Review & Rating System
- 🎁 Referral & Rewards Program

---

# 👨‍💻 Contributors

### Saniya Kousar

**MERN Stack Developer**

GitHub: https://github.com/yourusername

LinkedIn: https://linkedin.com/in/yourusername

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you found this project useful, don't forget to ⭐ the repository.

Happy Coding! 🚀

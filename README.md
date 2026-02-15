# Trends Store AI E-Commerce Platform

A modern e-commerce application powered by a Next.js 14 frontend and an intelligent Python-based AI Assistant backend. The platform features a responsive shopping interface, a comprehensive admin panel, and a smart chatbot capable of understanding Roman Urdu and providing real-time product recommendations.

## 🚀 Features

### 🛒 E-Commerce Website (Frontend)
- **Modern UI/UX**: Built with Next.js 14 (App Router) and Tailwind CSS.
- **Product Browsing**: Dynamic product listings with categories, ratings, and details.
- **Shopping Cart & Checkout**: Seamless cart management and order placement flow.
- **Admin Dashboard**:
  - **Product Management**: Add, edit, and delete products.
  - **Order Tracking**: View and manage customer orders.
  - **Customer Insights**: View customer data.
- **Authentication**: Secure user authentication.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.

### 🤖 AI Service (Backend)
- **Intelligent Chatbot**: Powered by **Groq (Llama 3.3 70B)** for natural language understanding.
- **Roman Urdu Support**: Tailored to answer and respond in Roman Urdu (e.g., "Kya yeh product available hai?").
- **RAG (Retrieval-Augmented Generation)**:
  - Uses **ChromaDB** as a vector store to index product data.
  - **HuggingFace Embeddings** (`all-MiniLM-L6-v2`) for semantic search.
  - Retrieves real-time product stock, price, and details to answer user queries.
- **Smart Search**: "Smart Extraction" logic to convert user queries (e.g., "Jhumka") into standardized search terms (e.g., "Earrings").
- **Persona**: Acts as a polite, professional sales assistant.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: JavaScript / React
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Database Driver**: `mysql2`

### Backend (AI Service)
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.10+
- **LLM Provider**: [Groq](https://groq.com/)
- **Vector DB**: [ChromaDB](https://www.trychroma.com/)
- **Orchestration**: LangChain
- **Embeddings**: HuggingFace (`sentence-transformers`)

### Database
- **Primary Data**: **MySQL** (Stores Products, Orders, Users).
- **Vector Data**: **Chroma (SQLite)** (Stores Product Embeddings for AI).

---

## 📋 Prerequisites

- **Node.js** (v18+)
- **Python** (v3.10+)
- **MySQL Server** (e.g., XAMPP, WAMP, or local install)
- **Groq API Key** (Get one from [Groq Console](https://console.groq.com/))

---

## ⚙️ Setup Instructions

### 1. Database Setup (MySQL)
Ensure your MySQL server is running and create a database named `ecommerce_db`. You may need to import an initial schema or allow the application to sync (check `src/lib/db.js` or admin panel for initialization).

### 2. Frontend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=ecommerce_db
   # Add other auth/next-auth secrets if required
   ```

### 3. Backend (AI Service) Setup
1. Navigate to the `ai-service` folder (or stay in root, commands below assume root).
2. Install Python dependencies:
   ```bash
   npm run py-install
   # OR manually:
   pip install -r ai-service/requirements.txt
   ```
3. Create a `.env` file in the `ai-service` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=ecommerce_db
   ```

### 4. Data Ingestion (Required for AI)
Before the chatbot can answer questions, you must ingest the product data from MySQL into the vector store.
```bash
python ai-service/scripts/ingest_data.py
```
*Note: Ensure MySQL is running and has product data before running this script.*

---

## ▶️ Running the Application

You can run both the frontend and backend concurrently using the pre-configured script:

```bash
npm run dev
```
This command triggers:
- **Next.js Frontend**: http://localhost:3000
- **FastAPI Backend**: http://localhost:8000 (running `ai-service/main.py`)

Alternatively, run them separately:
**Frontend:** `npm run next-dev`
**Backend:** `python ai-service/main.py`

---

## 🔌 API Documentation

### Backend (`http://localhost:8000`)
- **GET /**: Health check/Status.
- **POST /chat**: Main chat endpoint.
  - Body: `{"message": "user query", "session_id": "optional_id"}`
  - Returns: JSON with `response`, `product_ids`, and `products` metadata.
- **POST /sync-products**: Triggers the ingestion script to update the vector DB.

---

## ⚠️ Troubleshooting

- **Unicode Errors on Windows**: If you see emoji printing errors in the Python console, set `PYTHONIOENCODING=utf-8` (the `npm run dev` script handles this automatically).
- **Database Connection**: Ensure your MySQL credentials in both `.env.local` (Frontend) and `.env` (Backend) match.
- **Missing Dependencies**: If `pip install` fails, ensure you have C++ build tools installed (needed for some vector DB libraries).

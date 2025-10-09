# Phullstack AI Marketing Platform

This is a personal, educational project that demonstrates a "Phullstack" (full-stack) approach to building, modern web application for AI-powered marketing content generation. It's built with a mobile-first mindset, featuring a beautiful and modern user interface.

**Disclaimer:** This is a personal project created for learning and demonstration purposes. It is not intended for production use without further development and security hardening.

## ✨ Features

- User authentication and management.
- Project and asset management.
- Upload and processing of various asset types (text, image, audio, video).
- Automatic speech-to-text transcription for audio and video assets using OpenAI's Whisper.
- Integration with Stripe for subscription-based services.
- ... and more to come!

## 🚀 Tech Stack

This project uses a modern, robust, and scalable technology stack:

### **Frontend**

- **[Next.js](https://nextjs.org/)**: React framework for server-side rendering, static site generation, and more.
- **[React](https://react.dev/)**: A JavaScript library for building user interfaces.
- **[Node.js v20](https://nodejs.org/)**: JavaScript runtime environment.
- **[Yarn v3](https://yarnpkg.com/)**: Dependency management.
- **[Shadcn/ui](https://ui.shadcn.com/)**: Beautifully designed components.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.

### **Backend & Services**

- **[Python](https://www.python.org/)**: For the asset processing service.
- **[Poetry](https://python-poetry.org/)**: Dependency management for Python.
- **[OpenAI Whisper](https://openai.com/research/whisper)**: For highly accurate speech-to-text transcription.
- **[FFmpeg](https://ffmpeg.org/)**: For audio and video manipulation.

### **Database**

- **[PostgreSQL](https://www.postgresql.org/)**: Hosted on [Neon](https://neon.tech/).
- **[Drizzle ORM](https://orm.drizzle.team/)**: A next-generation TypeScript ORM.

### **Infrastructure & DevOps**

- **[Vercel](https://vercel.com/)**: Cloud platform for hosting the Next.js frontend.
- **[Vercel Blob](https://vercel.com/storage/blob)**: For storing user-uploaded assets.
- **[Railway](https://railway.app/)**: For CI/CD and hosting the backend services.
- **[Docker](https://www.docker.com/)**: For containerizing services.

### **Authentication & Payments**

- **[Clerk](https://clerk.com/)**: For user authentication and management.
- **[Stripe](https://stripe.com/)**: For payment processing and subscription management.

## 🏗️ Architecture Overview

The platform is built with a decoupled architecture:

1.  **Next.js Frontend**: The main user-facing application, handling UI, user interaction, and authentication. It's hosted on Vercel.
2.  **Python Asset Processing Service**: A separate backend service responsible for handling heavy-duty tasks like audio/video transcoding and AI-powered transcription. This service is containerized with Docker and can be deployed on platforms like Railway.
3.  **Database**: A serverless Postgres database from Neon provides persistent storage, accessed via the type-safe Drizzle ORM.
4.  **File Storage**: Vercel Blob is used for scalable and secure storage of user-uploaded media files.

This separation of concerns allows for independent scaling and development of the frontend and backend services.

## 🏁 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- Node.js v20 or later
- Yarn v3+
- Python 3.9+ and Poetry
- Docker and Docker Compose
- Access keys for various services (OpenAI, Clerk, Stripe, Neon, Vercel).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/phullstack-ai-marketing-platform.git
    cd phullstack-ai-marketing-platform
    ```

2.  **Set up the Frontend (Next.js):**

    ```bash
    cd nextjs
    yarn install
    ```

3.  **Set up the Backend (Python Service):**
    ```bash
    cd asset-processing-service
    poetry install
    ```

### Environment Variables

This project relies on several external services, which need to be configured via environment variables.

1.  **Frontend (`/nextjs/.env.local`):**

    Create a `.env.local` file in the `/nextjs` directory. You will need to add your credentials for Clerk, Stripe, Vercel Blob, and the database.

    ```env
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Neon Database
    DATABASE_URL="postgresql://..."

    # Vercel Blob Storage
    BLOB_READ_WRITE_TOKEN=

    # Stripe
    STRIPE_SECRET_KEY=
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
    STRIPE_WEBHOOK_SECRET=
    ```

2.  **Backend (`/asset-processing-service/.env`):**

    Create a `.env` file in the `/asset-processing-service` directory.

    ```env
    # OpenAI
    OPENAI_API_KEY=

    # Other service configurations...
    ```

### Running the Application

1.  **Start the Frontend Development Server:**

    ```bash
    cd nextjs
    yarn dev
    ```

    The application will be available at `http://localhost:3000`.

2.  **Start the Asset Processing Service:**
    ```bash
    cd asset-processing-service
    poetry run uvicorn src.asset_processing_service.main:app --reload
    ```

Enjoy exploring the application!

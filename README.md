# Jaden's AI Portfolio Chatbot

**Live Demo:** [Click here to view the live chatbot!](https://askjaden.dev/) ## Description

This is a full-stack web application featuring a personalized AI chatbot that serves as my interactive resume. Recruiters and other visitors can engage in a natural language conversation to ask questions about my skills, projects, experience, and education. The chat history persists across page reloads for a seamless user experience.

This project was built to demonstrate proficiency in full-stack development, modern frontend frameworks, AI model integration, and creating a polished, user-centric application.

---

## Project Architecture

This is a full-stack project built with a separate frontend and backend.

* **Frontend Repository (You are here):** [https://github.com/jadenS123/chatbot-frontend](https://github.com/jadenS123/chatbot-frontend) * **Backend Repository:** [https://github.com/jadenS123/chatbot-backend](https://github.com/jadenS123/chatbot-backend) ---

## Tech Stack

### Frontend
* **Framework:** Next.js
* **Language:** TypeScript
* **State Management:** React Hooks (`useState`, `useEffect`)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **AI:** Google Generative AI (Gemini Pro)
* **Deployment:** Railway

---

## Features

* **Interactive AI Conversation:** Leverages the Google Gemini model to provide dynamic, context-aware responses.
* **State Persistence:** Chat history is saved in `localStorage`, so conversations are not lost on page refresh.
* **Responsive Design:** A clean, modern UI that works seamlessly on desktop and mobile devices.
* **Live-Typing Indicators:** Enhances user experience by showing when the bot is processing a response.

---

## How to Run Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* npm

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/jadenS123/chatbot-frontend](https://github.com/jadenS123/chatbot-frontend)
    ```
2.  Navigate to the project directory:
    ```bash
    cd chatbot-frontend
    ```
3.  Install NPM packages:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
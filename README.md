<div align="center">
  <br />
  <img src="https://img.icons8.com/external-flaticons-flat-flat-icons/128/external-architect-professions-flaticons-flat-flat-icons.png" alt="Logo">
  <br />
  <h1 align="center">AI Resume & Cover Letter Architect</h1>
  <p align="center">
    An intelligent, AI-powered web application that architects professional, ATS-friendly resumes and tailored cover letters in seconds.
    <br />
    <a href="https://ai-resume-architect.onrender.com/" target="_blank"><strong>View Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/22bq1a42d4/AI-Resume-Architect/issues">Report Bug</a>
    ·
    <a href="https://github.com/22bq1a42d4/AI-Resume-Architect/issues">Request Feature</a>
  </p>
</div>

---

## About The Project

[![Product Hunt](./docs/screenshot.png)](https://ai-resume-architect.onrender.com/)

In today's competitive job market, a professionally crafted, ATS-friendly resume is non-negotiable. The **AI Resume & Cover Letter Architect** was built to bridge the gap between talented individuals and the opportunities they deserve. This tool leverages the power of large language models to transform your career details into polished, single-page documents that are designed to impress both recruiters and automated screening systems.

With an immersive, stunning UI and intelligent features like contact extraction and ATS-friendliness checks, this application goes beyond simple text generation. It's your personal career document specialist.

### Key Features

* ✨ **Stunning, Immersive UI:** A dark-themed, animated interface with glassmorphism effects that makes creating documents a pleasure.
* 🧠 **Intelligent AI Engine:** Powered by the Kimi K2 model via OpenRouter for high-quality, context-aware content generation.
* 📄 **ATS-Optimized Resumes:** Generates documents in a professional, two-column, reverse chronological format proven to be effective with Applicant Tracking Systems.
* ✍️ **Tailored Cover Letters:** Creates complete, ready-to-send cover letters using provided details like company name and hiring manager.
* 🤖 **Automated Contact Extraction:** Intelligently parses uploaded resumes to auto-fill your name, email, and phone number.
* 🔗 **Hyperlink Intelligence:** Detects when a resume might be using non-ATS-friendly "hidden" URLs and provides actionable tips.
* 📄 **One-Click PDF Export:** Download your beautifully formatted resume or cover letter as a high-quality, single-page PDF.

---

### Built With

This project utilizes a modern and powerful tech stack to deliver a seamless user experience.

* ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
* ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
* ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
* ![OpenRouter](https://img.shields.io/badge/OpenRouter-8A2BE2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjI0IDExMnYtOWE1NSA1NSAwIDAgMC0xMTAgMHY5aC05YTU1IDU1IDAgMCAwIDAgMTEwaDlhNTUgNTUgMCAwIDAgMTEwIDB2LTloOWE1NSA1NSAwIDAgMCAwLTExMGgtOVptLTU1IDg4YTM3IDM3IDAgMSAxIDM3LTM3YTM3IDM3IDAgMCAxLTM3IDM3Wm01NS0xMDBhMzcgMzcgMCAxIDEgMzctMzcgMzcgMzcgMCAwIDEtMzcgMzdaIi8+PC9zdmc+)
* ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.
* [Node.js](https://nodejs.org/en/download/)

### Installation

1.  **Clone the repository**
    ```sh
    git clone [https://github.com/22bq1a42d4/AI-Resume-Architect.git](https://github.com/22bq1a42d4/AI-Resume-Architect.git)
    ```
2.  **Navigate to the project directory**
    ```sh
    cd AI-Resume-Architect
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```
4.  **Set up your environment variables**
    * Create a file named `.env` in the root of the project.
    * Get your API key from [OpenRouter](https://openrouter.ai/).
    * Add your key to the `.env` file:
        ```env
        OPENROUTER_API_KEY=sk-or-v1-your-key-here
        ```
5.  **Run the server**
    ```sh
    node server.js
    ```
    Your application should now be running at `http://localhost:3000`.

---

## Deployment

This application is deployed on **Render**. You can deploy your own instance by following these steps:

1.  **Fork this repository.**
2.  Go to [render.com](https://render.com) and create a new **Web Service**, connecting it to your forked repository.
3.  Use the following settings during setup:
    * **Environment:** `Node`
    * **Build Command:** `npm install`
    * **Start Command:** `node server.js`
4.  Under the **"Environment Variables"** section, add a new variable:
    * **Key:** `OPENROUTER_API_KEY`
    * **Value:** Paste your secret API key from OpenRouter.
5.  Click **"Create Web Service"**. Render will automatically build and deploy your application.

---

## Author

👤 **22bq1a42d4**

* **GitHub:** [@22bq1a42d4](https://github.com/22bq1a42d4)
* Feel free to connect with me!

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

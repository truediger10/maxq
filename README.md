# MaxQ Collective Launch Schedule Application

## Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Installation and Setup](#installation-and-setup)
- [Current Progress](#current-progress)
- [Future Work](#future-work)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

The **MaxQ Collective Launch Schedule Application** is a web application that displays upcoming rocket launches, enriched with detailed information to engage space enthusiasts. The application fetches launch data from the RocketLaunch.Live API and utilizes the OpenAI API to enrich the data with additional insights such as mission objectives, payload information, fun facts, and historical context.

---

## Tech Stack

The project is built using the following technologies:

- **Backend:**
  - **Node.js**: JavaScript runtime environment.
  - **Express.js**: Web framework for Node.js.
  - **Axios**: Promise-based HTTP client for making API requests.
  - **Dotenv**: Module to load environment variables from a `.env` file.
  - **OpenAI API**: For enriching launch data with additional information.
  - **RocketLaunch.Live API**: Source of upcoming rocket launch data.
  - **Winston**: Logging library for Node.js applications.

- **Frontend:**
  - **HTML5**: Markup language for structuring the web content.
  - **CSS3**: Styling the web content.
  - **JavaScript (ES6+)**: For client-side scripting.
  - **Fetch API**: To make HTTP requests from the frontend.

- **Other Tools:**
  - **Git**: Version control system.
  - **npm**: Package manager for Node.js.
  - **Visual Studio Code**: Code editor.

---

## Installation and Setup

### Prerequisites

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher)

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/maxq-collective.git
   cd maxq-collective

# Arxiv Intellect

## Description

Arxiv Intellect is a dynamic and robust web application powered by a Flask backend, designed to deliver an efficient and user-friendly experience. This project leverages the flexibility and simplicity of the Flask framework, making it ideal for a wide range of applications, from simple web services to complex web applications.

## Getting Started

These instructions will guide you through setting up the project environment and running the application on your local machine for development and testing purposes.

### Prerequisites

- Anaconda or Miniconda

### Installing

1. **Clone the Repository**

   Start by cloning the repository to your local machine.

2. **Create a Conda Environment**

   Create a new Conda environment with Python 3.10:
   ```bash
   conda create --name <env-name> python=3.10
   ```

3. **Activate the Conda Environment**

   Activate the newly created environment:
   ```bash
   conda activate <env-name>
   ```

4. **Install Required Packages**

   Install all required packages using pip:
   ```bash
   pip install -r requirements.txt
   ```

5. **Initialize the Database**

   Set up the database with the following commands:
   ```bash
   flask db init          # Initializes a new migration repository
   flask db migrate       # Generates an initial migration
   flask db upgrade       # Applies the migration to the database
   ```

### Running the Application

**Start the Flask Application**

   Run the application using:
   ```bash
   flask run
   ```

   The website should now be accessible on your local server.

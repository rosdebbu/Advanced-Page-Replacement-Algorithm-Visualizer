# Advanced-Page-Replacement-Algorithm-Visualizer
# Advanced Page Replacement Algorithm Visualizer

> An interactive web-based tool designed to help Computer Science students understand, visualize, and analyze memory management algorithms. This project provides a hands-on approach to learning core Operating System concepts.

![Demo GIF](assets/visualizer-demo.gif)
*(Note: You'll need to create a folder named `assets` and add a short screen recording/GIF of your project in action named `visualizer-demo.gif` for the image above to work.)*

---

## ✨ Features

This visualizer is packed with features to provide a comprehensive learning experience:

- **Live Animated Simulation:** Watch FIFO, LRU, and Optimal algorithms execute step-by-step.
- **Algorithm Comparison Table:** Instantly run all algorithms on the same input to see which performs best, highlighting the winner.
- **Belady's Anomaly Analysis:** A dedicated chart that visualizes FIFO's performance across multiple frame counts to easily spot anomalies.
- **Step-by-step Timeline View:** Get a complete Gantt chart-style history of the memory frames after every simulation.
- **Adjustable Animation Speed:** Slow down the simulation to carefully study each step or speed it up for quick results.
- **Dynamic Inputs:** Use the "Generate Random" button for quick test cases or input your own custom page reference string.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charting Library:** [Chart.js](https://www.chartjs.org/) for data visualization.

## 🚀 How to Run Locally

This project is fully client-side and requires no special installation.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/rosdebbu/Advanced-Page-Replacement-Algorithm-Visualizer.git](https://github.com/rosdebbu/Advanced-Page-Replacement-Algorithm-Visualizer.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd Advanced-Page-Replacement-Algorithm-Visualizer
    ```
3.  **Open the `index.html` file in your favorite web browser.**

And you're all set!

## 🗺️ Project Roadmap

This project is actively being developed. The future vision is to evolve this tool into a full-stack, data-driven educational platform.

-   **Phase 1: Frontend Excellence**
    - [ ] Implement more algorithms (Second-Chance, LFU).
    - [ ] Add input history using `localStorage`.
    - [ ] Implement shareable URLs.

-   **Phase 2: Full-Stack Transition**
    - [ ] Refactor the frontend using **React & TypeScript**.
    - [ ] Build a **Java Spring Boot** backend for a REST API.
    - [ ] Add user accounts and database integration to save simulation results.

-   **Phase 3: Data Science Integration**
    - [ ] Allow benchmarking with large, real-world datasets.
    - [ ] Develop and integrate a predictive, ML-driven replacement algorithm.
    - [ ] Deploy the full-stack application to a cloud provider like AWS or GCP.

---

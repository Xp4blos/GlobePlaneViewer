⚠️ GlobePlaneViewer (Work in Progress)

GlobePlaneViewer is an interactive, web-based 3D application designed to monitor global aircraft traffic in real-time. Built with a focus on performance and visual clarity, it allows users to explore the skies through a high-fidelity 3D globe interface.

    Note: This project is currently under active development. Some features may be incomplete or subject to change.

🚀 Features

    Real-time Global Monitoring: Track aircraft across the globe using live flight data.

    3D Interactive Globe: A fully navigable 3D environment powered by Three.js.

    Interactive Aircraft: Click on any aircraft to highlight it and view detailed flight information.

    ICAO24 Search: Quickly find specific aircraft by searching for their unique ICAO24 transponder addresses.

    Visual Feedback: High-performance post-processing effects, including a "glow" outline for selected aircraft to ensure easy tracking.

🛠 Tech Stack

    Angular: Core framework for application logic and UI.

    Three.js: Used for rendering the 3D globe, aircraft models, and orbital mechanics.

    RxJS: Handling asynchronous data streams from flight APIs.

    OpenSky Network API: (Or your specific data source) Providing real-time flight state vectors.

    EffectComposer: Utilized for advanced post-processing effects like OutlinePass.

📸 Preview (Conceptual)
Observe hundreds of flights moving across continents.

Global View: <img width="1836" height="853" alt="low-q-img-readme" src="https://github.com/user-attachments/assets/f1485cdf-abd3-4fb3-9d25-9a3227ec8ec1" />

<img width="1658" height="1033" alt="2" src="https://github.com/user-attachments/assets/e332982e-a18b-47da-afbf-b24dc473c2ff" />



🚧 Roadmap

    [ ] Smooth interpolation for aircraft movement (no jumping).

    [ ] Historical flight path visualization (trails).

    [ ] Improved mobile touch controls.

    [ ] Custom 3D models for different aircraft types.

    [ ] Improved handling over 5000 aircrafts rendered at once
    

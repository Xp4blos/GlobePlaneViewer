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

    Global View: Observe hundreds of flights moving across continents.
<img width="3727" height="1683" alt="globe planes" src="https://github.com/user-attachments/assets/943d1cf2-269f-44a1-bf96-0067ad32bd72" />



🚧 Roadmap

    [ ] Smooth interpolation for aircraft movement (no jumping).

    [ ] Historical flight path visualization (trails).

    [ ] Improved mobile touch controls.

    [ ] Custom 3D models for different aircraft types.

    [ ] Improved handling over 5000 aircrafts rendered at once
    

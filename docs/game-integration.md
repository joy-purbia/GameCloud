# GameCloud — Game Integration & Feasibility Report

## 1. Playable Games (Built From Scratch)

### Game 1: Neon Racer 3D
- **Directory**: `frontend/public/games/neon-racer/`
- **Technology**: Three.js (r164), WebGL, HTML5 Web Audio API.
- **Architecture**:
  - Procedurally generated 3D highway with neon cyan borders and magenta dashed centerlines.
  - Custom geometric sports car model with glowing cabin, headlights, taillights, and spinning wheels.
  - Physics model simulating acceleration, braking, top speed (~240 km/h, 320 km/h with nitro), lateral turning speed, and drift mechanics.
  - Interactive obstacles: Red obstacle lasers reduce shield integrity and cause screen shake; magenta boost pads grant nitro speed.
  - Audio: Procedurally synthesized audio via Web Audio API (continuous engine hum whose pitch dynamically scales with vehicle speed, nitro chime, and crash audio).
  - Responsive Viewport: Automatically handles resize and aspect ratio changes.
  - Fully integrated into GameCloud player iframe with keyboard cheatsheet and session recording.

### Game 2: 2048 Cyber Grid
- **Directory**: `frontend/public/games/2048/`
- **Technology**: HTML5 Canvas / Grid, CSS3 Animations, Web Audio API.
- **Architecture**:
  - 4x4 matrix with slide and merge algorithms.
  - Smooth tile pop-in animations and cyberpunk color palette.
  - Dynamic score counter and persistent local storage high score.
  - Arrow keys, WASD, and touch gesture swipe support.
  - Web Audio API synthesizer for slide clicks, merge chimes, and victory fanfare.

---

## 2. External Game Catalogue & Feasibility Analysis

### Game 3: HexGL
- **Feasibility**: Feasible as a browser WebGL title (Tribute to Wipeout by Thibaut Despoulain).
- **Integration Status**: Marked as `experimental`. Full standalone asset bundling requires heavy 3D mesh files and texture decoders (~35 MB). The catalogue entry is established with proper technical badges.

### Game 4: SuperTuxKart
- **Feasibility**: Desktop C++ game with Irrlicht engine.
- **Browser Execution**: Requires an Emscripten WebAssembly (WASM) + WebGL build. Upstream STK-Wasm projects exist but require substantial asset bundling (>200 MB) or remote streaming.
- **Integration Status**: Marked as `coming_soon`.

### Game 5: Luanti (Minetest)
- **Feasibility**: C++ voxel sandbox engine.
- **Browser Execution**: A WebAssembly port is theoretically possible via Emscripten, but requires compiling extensive Lua scripting interpreters and voxel chunk loaders.
- **Integration Status**: Marked as `coming_soon`.

### Game 6: OpenArena
- **Feasibility**: id Tech 3 engine (Quake III clone).
- **Browser Execution**: While asm.js/Wasm ports of id Tech 3 exist, production multiplayer requires low-latency WebSockets and high graphical fidelity best served by containerized remote streaming.
- **Integration Status**: Marked as `experimental` (Remote streaming testbed).

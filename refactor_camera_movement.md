# Refactoring Camera Movement: Removing Scroll and Zoom

This document outlines the plan to refactor the camera movement in `src/App.jsx`. The goal is to remove all functionality related to scrolling and zooming, leaving only the side-to-side camera movement that responds to mouse movement.

## Phase 1: Removing Scroll and Zoom Logic from `src/App.jsx`

### 1. Remove GSAP and ScrollTrigger Dependencies
- Delete `import { gsap } from "gsap";`
- Delete `import { ScrollTrigger } from "gsap/ScrollTrigger";`
- Delete `gsap.registerPlugin(ScrollTrigger);`

### 2. Simplify State and Constants in `App` Component
- Remove the `isZoomed` state and `setIsZoomed` function.
- Remove the following constants for camera positions as they are related to scrolling sections:
    - `section1Position`
    - `section2Position`
    - `section2LookAtTarget`

### 3. Update `Canvas` and `App` Component Body
- Set a fixed initial position for the `Canvas` camera. We will use a position similar to the old `section2Position`, for example `[0, 0.8, 7.5]`.
- Remove the `SceneSetup` component from the `Canvas`.
- Update the `InnerScene` component props, removing `setIsZoomed`, `section2Position`, `section2LookAtTarget`, and `initialFov`.
- Put the `MouseCameraController` directly inside the `Canvas`.

### 4. Remove Unnecessary Components
- Delete the entire `SceneSetup` component. It's responsible for the scroll-based GSAP animations.
- Delete the entire `CameraUpdater` component. Its `lookAt` logic is tied to the removed scroll animation.

### 5. Adapt `MouseCameraController`
- Remove the `isZoomed` prop.
- Remove the `if (!isZoomed)` check inside `useFrame` so the mouse control is always active.
- Initialize `basePositionRef` with the camera's initial position inside a `useEffect` to ensure it has the correct starting value.

### 6. Update `InnerScene` Component
- Update the component's function signature to remove the props that are no longer passed from `App`.
- Since `Frames` component is commented out, no changes are needed there for now, but if it gets re-enabled, it should not use any of the removed props.

## Phase 2: Verification
- After applying the changes, run the application.
- Verify that there is no camera movement on scroll.
- Verify that the camera moves from side to side when the mouse is moved.
- Verify that there are no console errors related to the removed logic. 
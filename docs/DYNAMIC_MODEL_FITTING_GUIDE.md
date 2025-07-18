# Guide: Dynamically Fitting a 3D Model to the Screen with @react-three/drei

This guide documents the process of ensuring an asynchronously loaded 3D model is correctly framed by the camera using the `<Bounds>` and `useBounds` utilities from `@react-three/drei`.

## 1. The Problem: Asynchronous Loading vs. Initial Render

The `<Bounds>` component in `@react-three/drei` is a powerful tool for automatically adjusting the camera to fit its children. However, when used with the simple `fit` prop, it calculates the bounding box of its children only once, upon its initial render.

This creates a race condition when dealing with 3D models that are loaded asynchronously. The `Bounds` component often renders before the model has finished loading, sees an empty or placeholder object, and fits the camera to that instead of the final model. The result is a camera that is zoomed incorrectly or pointing at the wrong place.

## 2. The Solution: Programmatic Fitting with `useBounds`

To solve this, we need to trigger the fitting logic *after* the model has fully loaded. This is achieved by using the `useBounds` hook, which gives us programmatic access to the `Bounds` API.

The solution involves three key steps:
1.  **Modifying the Model Component**: The component loading the 3D model must be able to signal when it has finished loading and provide a `ref` to its root `Object3D`.
2.  **Creating a Controller Component**: A new component is created to orchestrate the interaction. It uses the `useBounds` hook and waits for the model's load signal.
3.  **Composing the Scene**: The components are arranged hierarchically to ensure the logic flows correctly.

---

## 3. Step-by-Step Implementation

### Step 3.1: Update the Model Component (`ProjekteText.jsx`)

The component responsible for loading the GLB/GLTF file must be adapted to do two things:
1.  **Accept a `ref`**: Use `React.forwardRef` to allow parent components to get a direct reference to the underlying `THREE.Group` or `THREE.Mesh`.
2.  **Provide an `onLoad` callback**: This function prop will be called once the model's loading process is complete.

```jsx
// src/Font-Projekte.jsx

import React, { useEffect } from 'react';
import { useModelLoader } from './utils/ModelLoader';

// Use React.forwardRef to pass the ref to the group
export const ProjekteText = React.forwardRef(({ onLoad, ...props }, ref) => {
  const { nodes, materials, loading } = useModelLoader(...);

  // When the loading state changes to false, call the onLoad callback
  useEffect(() => {
    if (!loading && onLoad) {
      onLoad();
    }
  }, [loading, onLoad]);

  if (loading) return null; // Or a loading placeholder

  return (
    // Attach the forwarded ref to the group
    <group {...props} ref={ref} dispose={null}>
      {/* ... mesh and light definitions ... */}
    </group>
  );
});

ProjekteText.displayName = "ProjekteText"; // Add display name for easier debugging
```

### Step 3.2: Create the Controller Component (`FitCameraToModel`)

This new component acts as a bridge. It wraps the model and uses the `useBounds` hook to access the `Bounds` API.

```jsx
// src/App.jsx

import { useBounds } from "@react-three/drei";
import React, { useRef, useCallback } from "react";

const FitCameraToModel = ({ children }) => {
  // 1. Get the Bounds API
  const bounds = useBounds();
  // 2. Create a ref to hold the model
  const ref = useRef();

  // 3. Define the callback that will be passed to the model's onLoad prop
  const handleLoad = useCallback(() => {
    if (ref.current) {
      // 4. Once loaded, refresh the bounds to measure the model and fit the camera
      bounds.refresh(ref.current).fit();
    }
  }, [bounds]);

  // 5. Clone the child (the model component) and inject the ref and onLoad props
  return React.cloneElement(children, { ref, onLoad: handleLoad });
};
```

### Step 3.3: Compose the Scene in `App.jsx`

Finally, assemble the components in the correct order. The `<Bounds>` component must be a parent to the controller, which in turn wraps the model.

```jsx
// src/App.jsx

import { Canvas } from "@react-three/fiber";
import { Bounds } from "@react-three/drei";
import { ProjekteText } from "./Font-Projekte";

const App = () => {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
      {/* 1. The Bounds component sets up the context. */}
      {/* `observe` makes it responsive to window resizing. */}
      {/* `margin` adds padding around the model. */}
      <Bounds observe margin={1.2}>
        {/* 2. The controller component manages the fitting logic. */}
        <FitCameraToModel>
          {/* 3. The model component loads the 3D asset. */}
          <ProjekteText
            position={[0, 7.8, -3]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </FitCameraToModel>
      </Bounds>
      {/* ... other scene elements ... */}
    </Canvas>
  );
};
```

---

## 4. Instructions for Future AI Agent

When tasked with fitting the camera to an asynchronously loaded 3D model using `@react-three/drei`, follow this procedure:

1.  **Analyze the Model Component**:
    *   Check if the component that loads the `.glb`/`.gltf` file uses `React.forwardRef`. If not, refactor it to do so.
    *   Verify if it has an `onLoad` prop or a similar mechanism to signal completion. If not, add one by monitoring its internal loading state with a `useEffect` hook.

2.  **Implement the Controller Pattern**:
    *   Do not apply the fitting logic directly in the main `App` or scene component.
    *   Create a dedicated "controller" component (e.g., `FitCameraToModel`, `BoundsController`).
    *   Inside this controller, use the `useBounds()` hook to get the bounds API.
    *   Use `React.cloneElement` to pass a `ref` and an `onLoad` handler to the child model component.

3.  **Define the `onLoad` Handler**:
    *   The handler function, typically wrapped in `useCallback`, should call `bounds.refresh(modelRef.current).fit()`. This sequence is critical: `refresh()` measures the object, and `fit()` moves the camera.

4.  **Structure the Scene Hierarchy**:
    *   Ensure the `<Bounds>` component is a parent of the controller component in the React tree.
    *   Place the controller component as a direct wrapper around the 3D model component.
    *   Add the `observe` prop to `<Bounds>` for responsive behavior on window resize.
    *   Add a `margin` prop (e.g., `margin={1.2}`) to `<Bounds>` to prevent the model from touching the screen edges.

5.  **Address Conflicts**:
    *   If other camera controls (e.g., `<OrbitControls>`, `<CameraControls>`, or a custom controller) are present, they may conflict with `<Bounds>`. Temporarily disable them to confirm the `<Bounds>` logic is working correctly. If they need to coexist, you may need to manage camera control states more explicitly. 
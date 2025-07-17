import * as THREE from "three";
import { useEffect, useRef, useState } from "react"; // Import useState
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useCursor,
  MeshReflectorMaterial,
  Image,
  Text,
  Environment,
  OrbitControls,
  Html,
  Resize,
  ContactShadows,
  MeshPortalMaterial,
  Stars,
  Center,
  CameraControls,
} from "@react-three/drei";

import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";

import Frames from "./Frames";
import Terrain from "./Terrain";

// import { Heading } from "./Site-headings";
import { ProjekteText } from "./Font-Projekte";
import AnimatedStars from "./AnimatedStars";
import getApiData from "./images";
import { devLog, devWarn, devError } from './utils/devLog';
import ErrorBoundary from './components/ErrorBoundary';
import ThreeErrorBoundary from './components/ThreeErrorBoundary';
import Env from "./Env";
import FloatingLight from "./FloatingLight";
import MouseCameraController from "./MouseCameraController";

const INITIAL_FOV = 60; // Define initial FOV



const App = ({ }) => {
  const innerSceneRef = useRef();
  const headingRef = useRef(); // Create ref for Heading
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneError, setSceneError] = useState(null);

  useEffect(() => {
    const extractImagesFromDOM = async () => {
      try {
        setIsLoading(true);
        // Ensure DOM is ready before extraction
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', async () => {
            const data = await getApiData();
            setImages(data);
            setIsLoading(false);
          });
        } else {
          // DOM is already ready
          const data = await getApiData();
          setImages(data);
          setIsLoading(false);
        }
      } catch (error) {
        devError('Failed to extract images from DOM:', error);
        setSceneError(error);
        setIsLoading(false);
      }
    };
    extractImagesFromDOM();
  }, []);

  const handleSceneError = (error) => {
    devError('Scene error:', error);
    setSceneError(error);
  };

  const handleSceneRetry = () => {
    setSceneError(null);
    window.location.reload();
  };

  const handleSceneFallback = () => {
    // Implement fallback scene or static content
    setSceneError(null);
    // You could set a state to show a simpler version of the scene
  };

  return (
    <ErrorBoundary>
      <ThreeErrorBoundary
        onError={handleSceneError}
        onRetry={handleSceneRetry}
        onFallback={handleSceneFallback}
      >
        <Canvas
          shadows
          dpr={1}
          gl={{ antialias: true }}
          camera={{ fov: INITIAL_FOV, position: [0, 8, 5] }} // Use INITIAL_FOV directly
          flat
        >
          <color attach="background" args={["#000000"]} />
          <fog attach="fog" args={["#000000", 0, 50]} />


/** CAMERA CONTROLS */
          {/* <OrbitControls /> */}
          {/* <CameraControls /> */}
          <MouseCameraController lookAtRef={headingRef} />

          <Env />
          <ProjekteText
            ref={headingRef}
            position={[0, 7.8, -3]}
            scale={1}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          />


          {isLoading ? (
            <Html center>
              <div style={{ color: 'white', fontSize: '18px' }}>
                Loading projects from DOM...
              </div>
            </Html>
          ) : (
            <InnerScene
              images={images}
              ref={innerSceneRef}
            />
          )}
          {/* <Environment preset="city" /> */}
          {/* <OrbitControls /> */}
          <EffectComposer>
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <Bloom mipmapBlur luminanceThreshold={1} intensity={1} />
          </EffectComposer>
          {/* </Resize> */}
        </Canvas>
      </ThreeErrorBoundary>
    </ErrorBoundary>
  );
};


// Pass props down to Frames
const InnerScene = ({
  images,
}) => {
  return (
    <group name="innerScene">
      <AnimatedStars
        radius={100}
        depth={50}
        count={5000}
      />
      <ambientLight intensity={1} />
      <pointLight
        position={[2, 5, 4]}
        intensity={50}
        color={"#ffffff"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-top={10}
        shadow-camera-right={10}
        shadow-camera-bottom={-10}
        shadow-camera-left={-10}
        shadow-radius={100}
        shadow-bias={-0.0001}
      />

      <group position={[0, -0.5, 0]}>
        {/* Pass props to Frames */}
        {/* <Frames
          images={images}
          setIsZoomed={setIsZoomed}
          section2Position={section2Position}
          section2LookAtTarget={section2LookAtTarget}
          initialFov={initialFov} // Pass initialFov down
        /> */}
        <Terrain
          position={[1, -0.74, -3]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 3]}
          scale={0.7}
        />
        <FloatingLight position={[0, 5, -20]} />
      </group>
      {/* <ContactShadows
        frames={1}
        opacity={1}
        scale={10}
        blur={1}
        far={10}
        position={[0, -0.6, 0]}
        resolution={256}
        color="#000000"
      /> */}
    </group>
  );
};

export default App;

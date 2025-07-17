import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Determine the model URL based on the environment
const isDevelopment = import.meta.env.DEV;
const localimages = {
    color: "/terrain_color_4x_blobby.webp",
    normal: "/terrain_normal_4x_blobby.webp",
    height: "/terrain_height_4x_blobby.webp",
};
const remoteImages = {
    color:
        "https://files.creative-directors.com/creative-website/creative25/scenes_imgs/terrain_color_4x_blobby.webp",
    normal:
        "https://files.creative-directors.com/creative-website/creative25/scenes_imgs/terrain_normal_4x_blobby.webp",
    height:
        "https://files.creative-directors.com/creative-website/creative25/scenes_imgs/terrain_height_4x_blobby.webp",
};
const img = isDevelopment ? localimages : remoteImages;

export default function Terrain({ position, rotation, scale }) {
    const meshRef = useRef();
    const materialRef = useRef();

    // Create refs for the texture loaders with updated blobby versions
    const colorMapRef = useRef(
        new THREE.TextureLoader().load(img.color, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        })
    );

    const normalMapRef = useRef(
        new THREE.TextureLoader().load(img.normal, (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        })
    );

    const displacementMapRef = useRef(new THREE.TextureLoader().load(img.height));

    useFrame((state) => {
        // if (materialRef.current) {
        //   // Oscillate between purple (270) and blue (240) hues
        //   const time = state.clock.getElapsedTime();
        //   const hue = 230 + Math.sin(time * 0.2) * 25; // Oscillate between ~225 and ~255
        //   materialRef.current.color = new THREE.Color(`hsl(${hue}, 70%, 50%)`);
        // }
    });

    return (
        <mesh
            ref={meshRef}
            name="moon"
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <planeGeometry args={[50, 50, 64, 64]} />
            <meshPhysicalMaterial
                ref={materialRef}
                roughness={0.8}
                metalness={0.2}
                map={colorMapRef.current}
                normalMap={normalMapRef.current}
                displacementMap={displacementMapRef.current}
                displacementScale={8}
                displacementBias={0}
            />
        </mesh>
    );
};
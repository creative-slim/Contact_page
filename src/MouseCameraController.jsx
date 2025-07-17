import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function MouseCameraController({ lookAtRef }) {
    const { camera } = useThree()
    const mouseX = useRef(0)
    const basePositionRef = useRef(new THREE.Vector3())
    const targetPositionRef = useRef(new THREE.Vector3())

    // Simplified parameters for horizontal movement
    const MAX_HORIZONTAL_OFFSET = 0.5 // Max distance camera can move from its base position
    const LERP_SPEED = 0.05 // Smoothing factor for the camera movement

    useEffect(() => {
        basePositionRef.current.copy(camera.position)

        const handleMouseMove = (event) => {
            mouseX.current = (event.clientX / window.innerWidth) * 2 - 1
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [camera])

    useFrame(() => {
        // Calculate the target X position based on the base position and mouse offset
        const targetX = basePositionRef.current.x + mouseX.current * MAX_HORIZONTAL_OFFSET

        // Set the target position for the camera to lerp towards
        targetPositionRef.current.set(targetX, basePositionRef.current.y, basePositionRef.current.z)

        // Smoothly interpolate the camera's position
        camera.position.lerp(targetPositionRef.current, LERP_SPEED)

        if (lookAtRef.current) {
            camera.lookAt(lookAtRef.current.position)
        }
    })

    return null
}
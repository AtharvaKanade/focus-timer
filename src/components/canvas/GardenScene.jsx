import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, ContactShadows, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import useTimerStore from '../../store/useTimerStore';
import Plant from './Plant';

const GardenScene = () => {
    const { gardenHealth } = useTimerStore();
    const fogRef = useRef();

    // Animate fog based on health
    useFrame((state, delta) => {
        if (fogRef.current) {
            // High health = Low density, Clear color
            // Low health = High density, Gray color
            const targetDensity = THREE.MathUtils.lerp(0.1, 0.02, gardenHealth / 100);
            const targetColor = new THREE.Color().lerpColors(
                new THREE.Color('#728ca1'), // Gray/Fog (Unhealthy)
                new THREE.Color('#1d382d'), // Moss/Dark (Healthy - clear view)
                gardenHealth / 100
            );

            fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, targetDensity, delta * 0.5);
            fogRef.current.color.lerp(targetColor, delta * 0.5);
            state.scene.background = fogRef.current.color;
        }
    });

    return (
        <>
            <fogExp2 ref={fogRef} attach="fog" args={['#1d382d', 0.02]} />

            {/* Lighting */}
            <ambientLight intensity={0.5} color="#c5d9ce" />
            <spotLight
                position={[10, 10, 5]}
                angle={0.15}
                penumbra={1}
                intensity={1}
                castShadow
                color="#f0d98f"
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#5da182" />

            {/* Environment / Background */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Ground / Base */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                <circleGeometry args={[10, 64]} />
                <meshStandardMaterial
                    color="#224436"
                    roughness={0.8}
                    metalness={0.2}
                />
            </mesh>

            {/* Glass Terrarium Sphere (Optional visual container) */}
            <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[8, 32, 32]} />
                <meshPhysicalMaterial
                    transmission={0.2}
                    roughness={0.1}
                    thickness={2}
                    color="#dbede3"
                    side={THREE.BackSide}
                    transparent
                    opacity={0.1}
                />
            </mesh>

            <Plant />

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2}
                autoRotate
                autoRotateSpeed={0.5}
            />

            {/* Ambient Co-working "Souls" */}
            <Sparkles
                count={50}
                scale={12}
                size={4}
                speed={0.4}
                opacity={0.5}
                color="#f0d98f"
            />

            {/* Shadow Catcher */}
            <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
        </>
    );
};

export default GardenScene;

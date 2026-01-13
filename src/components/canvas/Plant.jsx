import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useTimerStore from '../../store/useTimerStore';

// A single branch segment with its children
const Branch = ({ startPos, direction, length, thickness, depth, maxDepth, growthProgress }) => {
    const meshRef = useRef();

    // Each depth level grows during a specific portion of the total progress
    const layerSize = 100 / (maxDepth + 1);
    const startThreshold = depth * layerSize;
    const endThreshold = (depth + 1) * layerSize;

    let localGrowth = 0;
    if (growthProgress >= endThreshold) localGrowth = 1;
    else if (growthProgress <= startThreshold) localGrowth = 0;
    else localGrowth = (growthProgress - startThreshold) / layerSize;

    // Use easing for smoother animation
    const easedGrowth = Math.pow(localGrowth, 0.5);

    // Calculate end position of this branch
    const endPos = useMemo(() => {
        return [
            startPos[0] + direction[0] * length,
            startPos[1] + direction[1] * length,
            startPos[2] + direction[2] * length,
        ];
    }, [startPos, direction, length]);

    // Generate child branches
    const childBranches = useMemo(() => {
        if (depth >= maxDepth) return null;

        const branches = [];
        const childCount = depth < 2 ? 2 : 3; // More branches at higher depths

        for (let i = 0; i < childCount; i++) {
            // Create varied angles for organic look
            const angleSpread = Math.PI / 3; // 60 degrees
            const baseAngle = (i / childCount) * Math.PI * 2 + (depth * 0.5); // Rotate based on depth

            const newDir = [
                Math.sin(baseAngle) * 0.5 + direction[0] * 0.5,
                0.7 + Math.random() * 0.3, // Mostly upward
                Math.cos(baseAngle) * 0.5 + direction[2] * 0.5,
            ];

            // Normalize direction
            const mag = Math.sqrt(newDir[0] ** 2 + newDir[1] ** 2 + newDir[2] ** 2);
            newDir[0] /= mag;
            newDir[1] /= mag;
            newDir[2] /= mag;

            branches.push(
                <Branch
                    key={`${depth}-${i}`}
                    startPos={endPos}
                    direction={newDir}
                    length={length * 0.7}
                    thickness={thickness * 0.6}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    growthProgress={growthProgress}
                />
            );
        }
        return branches;
    }, [depth, maxDepth, length, thickness, endPos, growthProgress, direction]);

    // Calculate midpoint for cylinder position
    const midPoint = [
        (startPos[0] + endPos[0]) / 2,
        (startPos[1] + endPos[1]) / 2,
        (startPos[2] + endPos[2]) / 2,
    ];

    // Calculate rotation to point cylinder from start to end
    const cylinderRotation = useMemo(() => {
        const dir = new THREE.Vector3(
            endPos[0] - startPos[0],
            endPos[1] - startPos[1],
            endPos[2] - startPos[2]
        ).normalize();

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);
        return [euler.x, euler.y, euler.z];
    }, [startPos, endPos]);

    // Don't render if not grown yet
    if (easedGrowth <= 0) return null;

    // Calculate actual length based on growth
    const currentLength = length * easedGrowth;

    return (
        <>
            {/* The Branch Cylinder */}
            <mesh
                ref={meshRef}
                position={[
                    startPos[0] + direction[0] * currentLength / 2,
                    startPos[1] + direction[1] * currentLength / 2,
                    startPos[2] + direction[2] * currentLength / 2,
                ]}
                rotation={cylinderRotation}
            >
                <cylinderGeometry args={[thickness * 0.6, thickness, currentLength, 8]} />
                <meshStandardMaterial
                    color={depth === 0 ? "#3e8466" : "#5da182"}
                    roughness={0.7}
                    emissive="#1d382d"
                    emissiveIntensity={0.15}
                />
            </mesh>

            {/* Leaf/Bud at the tip for terminal branches or as decorative elements */}
            {depth >= maxDepth - 1 && easedGrowth > 0.5 && (
                <mesh
                    position={[
                        startPos[0] + direction[0] * currentLength,
                        startPos[1] + direction[1] * currentLength,
                        startPos[2] + direction[2] * currentLength,
                    ]}
                    scale={[(easedGrowth - 0.5) * 2, (easedGrowth - 0.5) * 2, (easedGrowth - 0.5) * 2]}
                >
                    <dodecahedronGeometry args={[thickness * 3, 0]} />
                    <meshStandardMaterial
                        color="#f0d98f"
                        emissive="#e6c760"
                        emissiveIntensity={0.4}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            )}

            {/* Render children only after this branch has started growing */}
            {easedGrowth > 0.3 && childBranches}
        </>
    );
};

const Plant = () => {
    const { plantGrowth } = useTimerStore();

    return (
        <group position={[0, -1.5, 0]}>
            <Branch
                startPos={[0, 0, 0]}
                direction={[0, 1, 0]}
                length={1.2}
                thickness={0.15}
                depth={0}
                maxDepth={4}
                growthProgress={plantGrowth}
            />
        </group>
    );
};

export default Plant;

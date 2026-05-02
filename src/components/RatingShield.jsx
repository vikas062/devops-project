import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, ContactShadows, useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

const ShieldMesh = ({ color, score }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    // A simple stylized shield geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.5);
    shape.bezierCurveTo(1.5, 1.5, 1.5, 0, 0, -1.8);
    shape.bezierCurveTo(-1.5, 0, -1.5, 1.5, 0, 1.5);

    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };

    return (
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} envMapIntensity={1} />
            </mesh>

            {/* Inner Rim */}
            <mesh position={[0, 0, 0.35]}>
                <extrudeGeometry args={[shape, { ...extrudeSettings, depth: 0.05, bevelSize: 0.02 }]} />
                <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
            </mesh>

            <Text
                position={[0, 0.2, 0.5]}
                fontSize={0.6}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                {score}
            </Text>
            <Text
                position={[0, -0.4, 0.5]}
                fontSize={0.25}
                color="rgba(255,255,255,0.7)"
                anchorX="center"
                anchorY="middle"
            >
                C-SCORE
            </Text>
        </group>
    );
};

export const RatingShield = ({ rating = 500 }) => {
    const getShieldColor = (score) => {
        if (score > 2000) return '#ef4444'; // Red (Grandmaster)
        if (score > 1500) return '#eab308'; // Gold (Master)
        if (score > 1000) return '#a855f7'; // Purple (Expert)
        if (score > 500) return '#3b82f6';  // Blue (Specialist)
        return '#22c55e'; // Green (Newbie)
    };

    return (
        <div className="h-[300px] w-full relative">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <ShieldMesh color={getShieldColor(rating)} score={rating} />
                </Float>

                <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
            </Canvas>
        </div>
    );
};

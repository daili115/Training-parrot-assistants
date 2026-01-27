import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { TextureLoader, MeshPhongMaterial, MeshBasicMaterial, DoubleSide } from "three";
import {
    CAMERA_DISTANCE,
    PHONE_CURVE_SEGMENTS,
    PHONE_SHININESS,
    getPhoneLayout,
} from "./helpers/layout";
import { roundedRect } from "./helpers/rounded-rectangle";
import { RoundedBox } from "./RoundedBox";

export const Phone3D: React.FC<{
    readonly phoneColor: string;
    readonly imageSrc: string;
    readonly baseScale: number;
}> = ({ phoneColor, imageSrc, baseScale }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const camera = useThree((state) => state.camera);
    useEffect(() => {
        camera.position.set(0, 0, CAMERA_DISTANCE);
        camera.near = 0.2;
        camera.far = Math.max(5000, CAMERA_DISTANCE * 2);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    const constantRotation = interpolate(
        frame,
        [0, durationInFrames],
        [0, Math.PI * 2],
    );

    const entranceAnimation = spring({
        frame,
        fps,
        config: {
            damping: 20,
            stiffness: 100,
        },
    });

    const rotateY = constantRotation;
    const translateY = interpolate(entranceAnimation, [0, 1], [-2, 0]);

    // Use a fixed aspect ratio for the screen if we don't have the image dimensions yet
    // Most phone screenshots are 9:19 or 9:16
    const aspectRatio = 9 / 19.5;
    const layout = useMemo(() => getPhoneLayout(aspectRatio, baseScale), [aspectRatio, baseScale]);

    const screenGeometry = useMemo(() => {
        return roundedRect({
            width: layout.screen.width,
            height: layout.screen.height,
            radius: layout.screen.radius,
        });
    }, [layout.screen]);

    const texture = useMemo(() => {
        return new TextureLoader().load(imageSrc);
    }, [imageSrc]);

    return (
        <group
            scale={entranceAnimation}
            rotation={[0, rotateY, 0]}
            position={[0, translateY, 0]}
        >
            <RoundedBox
                radius={layout.phone.radius}
                depth={layout.phone.thickness}
                curveSegments={PHONE_CURVE_SEGMENTS}
                position={layout.phone.position}
                width={layout.phone.width}
                height={layout.phone.height}
            >
                <meshPhongMaterial color={phoneColor} shininess={PHONE_SHININESS} />
            </RoundedBox>
            <mesh position={layout.screen.position}>
                <shapeGeometry args={[screenGeometry]} />
                <meshBasicMaterial map={texture} side={DoubleSide} />
            </mesh>
        </group>
    );
};

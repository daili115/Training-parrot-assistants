import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile } from 'remotion';
import { Bird, Mic, Play, Settings, Info, Heart, Shield } from 'lucide-react';
import { ThreeCanvas } from "@remotion/three";
import { Phone3D } from './Phone3D';

const Title: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const move = spring({
        frame,
        fps,
        config: {
            damping: 12,
        },
    });

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            opacity,
            transform: `translateY(${(1 - move) * 50}px)`,
        }}>
            <h1 style={{ fontSize: 120, fontWeight: 'bold', marginBottom: 20 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 60, opacity: 0.8 }}>{subtitle}</p>}
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '40px 60px',
            borderRadius: 30,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 20,
            minWidth: 300,
            border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <div style={{ color: '#4ade80', marginBottom: 20 }}>
                {icon}
            </div>
            <div style={{ color: 'white', fontSize: 40, fontWeight: '500', textAlign: 'center' }}>
                {label}
            </div>
        </div>
    );
};

export const Main: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    return (
        <AbsoluteFill style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)' }}>
            {/* Scene 1: Intro */}
            <Sequence from={0} durationInFrames={90}>
                <Title title="鹦鹉学舌助手" subtitle="让您的鹦鹉成为语言大师" />
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', transform: 'translateY(-250px)' }}>
                    <Bird size={200} color="#4ade80" />
                </AbsoluteFill>
            </Sequence>

            {/* Scene 2: Core Features with 3D Phone */}
            <Sequence from={90} durationInFrames={180}>
                <AbsoluteFill style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 100px' }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        opacity: interpolate(frame, [90, 110], [0, 1]),
                        transform: `translateX(${interpolate(frame, [90, 110], [-50, 0])}px)`
                    }}>
                        <FeatureCard icon={<Mic size={80} />} label="录制训练词汇" />
                        <FeatureCard icon={<Settings size={80} />} label="14种变声特效" />
                    </div>

                    <div style={{
                        flex: 2,
                        height: '80%',
                        position: 'relative',
                        transform: `translateY(${Math.sin(frame / 15) * 15}px)` // Floating animation
                    }}>
                        <ThreeCanvas width={width * 0.5} height={height * 0.8} style={{ width: '100%', height: '100%' }}>
                            <ambientLight intensity={1.5} />
                            <pointLight position={[10, 10, 10]} intensity={1} />
                            <Phone3D
                                phoneColor="#1e293b"
                                imageSrc={staticFile('screenshot.png')}
                                baseScale={1.2}
                            />
                        </ThreeCanvas>
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        opacity: interpolate(frame, [90, 110], [0, 1]),
                        transform: `translateX(${interpolate(frame, [90, 110], [50, 0])}px)`
                    }}>
                        <FeatureCard icon={<Play size={80} />} label="科学定时训练" />
                        <FeatureCard icon={<Heart size={80} />} label="掌握进度跟踪" />
                    </div>
                </AbsoluteFill>
            </Sequence>


            {/* Scene 3: Easy Mode Transition */}
            <Sequence from={270} durationInFrames={210}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
                    <h2 style={{ fontSize: 100, fontWeight: 'bold', background: 'linear-gradient(to right, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>特别推出：简易模式</h2>
                    <p style={{ fontSize: 50, marginTop: 30, opacity: 0.9 }}>专为老年用户设计</p>

                    <div style={{ display: 'flex', marginTop: 80 }}>
                        <FeatureCard icon={<Shield size={80} />} label="大按钮 / 大字体" />
                        <FeatureCard icon={<Info size={80} />} label="语音辅助指引" />
                    </div>
                </div>
            </Sequence>

            {/* Scene 4: Conclusion */}
            <Sequence from={480} durationInFrames={120}>
                <Title title="开启AI训练新体验" subtitle="立即下载尝试" />
                <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100 }}>
                    <div style={{
                        background: 'linear-gradient(to right, #4ade80, #22d3ee)',
                        color: '#0f172a',
                        padding: '25px 80px',
                        borderRadius: 50,
                        fontSize: 45,
                        fontWeight: 'bold',
                        boxShadow: '0 10px 30px rgba(74, 222, 128, 0.3)'
                    }}>
                        Parrot-Assistants
                    </div>
                </AbsoluteFill>
            </Sequence>
        </AbsoluteFill>
    );
};


import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { Terminal, Cpu, Download, Rocket, CheckCircle, Code, Monitor, X, Square, Minus } from 'lucide-react';

const TerminalWindow: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
    return (
        <div style={{
            width: '90%',
            height: '85%',
            background: '#0c0c0c',
            borderRadius: '12px',
            boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #333',
        }}>
            {/* Windows Title Bar */}
            <div style={{
                height: '40px',
                background: '#1f1f1f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 15px',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Monitor size={16} color="#4ade80" />
                    <span style={{ color: '#ccc', fontSize: '14px', fontFamily: 'Segoe UI, sans-serif' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Minus size={16} color="#ccc" />
                    <Square size={14} color="#ccc" />
                    <X size={16} color="#ccc" />
                </div>
            </div>

            {/* Terminal Content */}
            <div style={{
                flex: 1,
                padding: '40px',
                fontFamily: '"Cascadia Code", Consolas, monospace',
                fontSize: '28px',
                color: '#cccccc',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {children}
            </div>
        </div>
    );
};

const Title: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
    const frame = useCurrentFrame();

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            opacity,
        }}>
            <h1 style={{ fontSize: 70, fontWeight: 'bold', marginBottom: 10, color: '#4ade80' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: 32, opacity: 0.7, color: '#94a3b8' }}>{subtitle}</p>}
            <div style={{ height: '2px', background: '#4ade80', width: '100px', marginTop: 20 }} />
        </div>
    );
};

const Prompt: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <div style={{ display: 'flex', marginBottom: '20px', opacity }}>
            <span style={{ color: '#4ade80', marginRight: '15px' }}>PS C:\Parrot-Assistants&gt;</span>
            <span style={{ color: '#ffffff' }}>{children}</span>
        </div>
    );
};

const Output: React.FC<{ children: React.ReactNode; delay: number; color?: string }> = ({ children, delay, color = '#cccccc' }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <div style={{ marginBottom: '30px', marginLeft: '20px', color, opacity, fontSize: '24px' }}>
            {children}
        </div>
    );
};

export const DeploymentMain: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ background: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
            <TerminalWindow title="Windows PowerShell - Parrot Mimic Assistant">

                {/* Scene 1: Intro */}
                <Sequence from={0} durationInFrames={120}>
                    <div style={{ marginTop: '50px' }}>
                        <Title title="DEPLOYMENT GUIDE" subtitle="Windows Terminal Edition" />
                        <div style={{ marginTop: '60px', color: '#666', fontSize: '20px' }}>
                            [Version 1.0.0] <br />
                            (c) Parrot Assistants Corporation. All rights reserved.
                        </div>
                    </div>
                </Sequence>

                {/* Scene 2: Install */}
                <Sequence from={120} durationInFrames={150}>
                    <div style={{ marginTop: '20px' }}>
                        <Prompt delay={10}>node --version</Prompt>
                        <Output delay={25}>v18.17.0</Output>

                        <Prompt delay={50}>npm install</Prompt>
                        <Output delay={70} color="#64748b">
                            added 842 packages in 4s <br />
                            found 0 vulnerabilities
                        </Output>
                    </div>
                </Sequence>

                {/* Scene 3: Config */}
                <Sequence from={270} durationInFrames={150}>
                    <div style={{ marginTop: '20px' }}>
                        <Prompt delay={10}>notepad .env.local</Prompt>
                        <Output delay={30} color="#4ade80">
                            # File updated <br />
                            GEMINI_API_KEY=●●●●●●●●●●●●●●●●
                        </Output>
                        <div style={{
                            marginTop: '40px',
                            padding: '20px',
                            borderLeft: '4px solid #facc15',
                            background: '#241a02',
                            color: '#facc15',
                            fontSize: '22px'
                        }}>
                            WARNING: Ensure your API key is correctly quoted if it contains special characters.
                        </div>
                    </div>
                </Sequence>

                {/* Scene 4: Run */}
                <Sequence from={420} durationInFrames={120}>
                    <div style={{ marginTop: '20px' }}>
                        <Prompt delay={10}>npm run dev</Prompt>
                        <Output delay={30} color="#22d3ee">
                            VITE v6.0.0  ready in 480ms <br />
                            ➜  Local:   http://localhost:5173/ <br />
                            ➜  Network: use --host to expose
                        </Output>
                    </div>
                </Sequence>

                {/* Scene 5: Done */}
                <Sequence from={540} durationInFrames={120}>
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            padding: '40px',
                            borderRadius: '20px',
                            border: '2px solid #4ade80',
                            textAlign: 'center',
                            background: 'rgba(74, 222, 128, 0.05)',
                            transform: `scale(${spring({ frame: frame - 540, fps, config: { stiffness: 100 } })})`
                        }}>
                            <CheckCircle size={80} color="#4ade80" style={{ marginBottom: '20px' }} />
                            <div style={{ fontSize: '48px', color: '#4ade80', fontWeight: 'bold' }}>SUCCESS</div>
                            <div style={{ fontSize: '24px', color: '#cccccc', marginTop: '10px' }}>Deployment complete</div>
                        </div>
                    </div>
                </Sequence>

            </TerminalWindow>
        </AbsoluteFill>
    );
};

import { Composition } from 'remotion';
import { Main } from './Main';
import { DeploymentMain } from './DeploymentMain';

export { Main };

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Demo"
                component={Main}
                durationInFrames={600} // 20 seconds at 30 fps
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="Deployment"
                component={DeploymentMain}
                durationInFrames={660} // 22 seconds at 30 fps
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};

import { Configuration, NodeEnvType } from '../types';

export default interface ConfigurationRepository {
    get(): Configuration;
    setEnv(env: NodeEnvType): void;
}

declare module "@mkkellogg/gaussian-splats-3d" {
  export enum SceneFormat {
    Ply = 0,
    Splat = 1,
    KSplat = 2,
  }

  export enum SceneRevealMode {
    Default = 0,
    Gradual = 1,
    Instant = 2,
  }

  export enum LogLevel {
    None = 0,
    Error = 1,
    Warning = 2,
    Info = 3,
    Debug = 4,
  }

  export interface Vector3Like {
    x: number;
    y: number;
    z: number;
    set: (x: number, y: number, z: number) => Vector3Like;
    copy: (v: Vector3Like) => Vector3Like;
  }

  export interface OrbitControlsLike {
    target: Vector3Like;
    enablePan: boolean;
    enableRotate: boolean;
    enableZoom: boolean;
    enableDamping: boolean;
    update: () => void;
  }

  export interface SplatMeshLike {
    getSplatCount?: () => number;
    calculatedSceneCenter: Vector3Like;
    maxSplatDistanceFromSceneCenter: number;
  }

  export interface ViewerOptions {
    rootElement?: HTMLElement;
    useBuiltInControls?: boolean;
    selfDrivenMode?: boolean;
    sharedMemoryForWorkers?: boolean;
    gpuAcceleratedSort?: boolean;
    sceneRevealMode?: SceneRevealMode;
    logLevel?: LogLevel;
    initialCameraPosition?: [number, number, number];
    initialCameraLookAt?: [number, number, number];
    inMemoryCompressionLevel?: number;
    freeIntermediateSplatData?: boolean;
    sphericalHarmonicsDegree?: number;
  }

  export interface AddSplatSceneOptions {
    showLoadingUI?: boolean;
    splatAlphaRemovalThreshold?: number;
    format?: SceneFormat;
  }

  export class Viewer {
    camera: {
      position: { set: (x: number, y: number, z: number) => void };
      lookAt: (x: number, y: number, z: number) => void;
      updateProjectionMatrix?: () => void;
    };
    controls?: OrbitControlsLike;
    constructor(options?: ViewerOptions);
    addSplatScene(path: string, options?: AddSplatSceneOptions): Promise<void>;
    getSplatMesh(): SplatMeshLike | null;
    start(): void;
    stop(): void;
    dispose(): Promise<void>;
  }
}

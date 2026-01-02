export type AgentStatus = "idle" | "running" | "completed" | "failed";
interface LiveAgentVisualizerProps {
    currentAgent: string;
    message: string;
    progress: number;
}
export declare function LiveAgentVisualizer({ currentAgent, message, progress }: LiveAgentVisualizerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=agent-visualizer-live.d.ts.map
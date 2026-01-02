import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Layout from "@/components/layout";
import { LiveAgentVisualizer } from "@/components/agent-visualizer-live";
import { ScanInput } from "@/components/scan-input";
import { VulnerabilityCard } from "@/components/vulnerability-card";
import { useScan, useVulnerabilities, useScanDetails } from "@/hooks/use-scan";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import generatedImage from "@assets/generated_images/abstract_dark_blue_cyber_security_network_visualization_with_glowing_nodes.png";
export default function Dashboard() {
    const { startScan, progress } = useScan();
    const [currentScanId, setCurrentScanId] = useState(null);
    const { data: vulnerabilities = [] } = useVulnerabilities(currentScanId);
    const { data: scanDetails } = useScanDetails(currentScanId);
    const isScanning = progress?.status === "running";
    const scanComplete = progress?.status === "completed" || scanDetails?.status === "completed";
    useEffect(() => {
        if (progress?.scanId) {
            setCurrentScanId(progress.scanId);
        }
    }, [progress]);
    const handleStartScan = async (url) => {
        try {
            const result = await startScan.mutateAsync(url);
            setCurrentScanId(result.scanId);
        }
        catch (error) {
            console.error("Failed to start scan:", error);
        }
    };
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length;
    return (_jsxs(Layout, { children: [_jsxs("div", { className: "fixed inset-0 pointer-events-none z-0", children: [_jsx("div", { className: "absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-black/0 to-background z-10" }), _jsx("img", { src: generatedImage, alt: "Background", className: "w-full h-[600px] object-cover opacity-20" })] }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "mb-10", children: [_jsx("h1", { className: "text-4xl font-bold tracking-tight mb-2 font-sans", children: "Security Overview" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Autonomous Agentic Vulnerability Analysis" })] }), _jsx(ScanInput, { onStart: handleStartScan }), _jsxs("div", { className: "mb-12", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-xl font-bold flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-primary rounded-full" }), "Active Agents"] }), isScanning && _jsx("span", { className: "text-xs font-mono text-primary animate-pulse", children: "PROCESSING..." })] }), progress ? (_jsx(LiveAgentVisualizer, { currentAgent: progress.currentAgent, message: progress.message, progress: progress.progress })) : (_jsx("div", { className: "text-center text-muted-foreground py-12", children: "Start a scan to see agents in action" }))] }), scanComplete && vulnerabilities.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Security Findings" }), _jsxs("div", { className: "flex gap-2", children: [criticalCount > 0 && (_jsxs("span", { className: "px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20", children: [criticalCount, " Critical"] })), highCount > 0 && (_jsxs("span", { className: "px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20", children: [highCount, " High"] }))] })] }), _jsx("div", { className: "space-y-4", children: vulnerabilities.map((vuln, index) => (_jsx(VulnerabilityCard, { vuln: vuln, index: index }, vuln.id))) })] }))] })] }));
}
//# sourceMappingURL=dashboard.js.map
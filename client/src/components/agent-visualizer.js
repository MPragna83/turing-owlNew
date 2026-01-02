import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, Terminal, Brain, FileSearch, ShieldCheck, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
function AgentCard({ title, description, icon: Icon, status, logs }) {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);
    return (_jsxs("div", { className: cn("relative flex flex-col h-full rounded-xl border transition-all duration-500 overflow-hidden", status === "running" ? "border-primary/50 bg-primary/5 shadow-[0_0_30px_-10px_var(--color-primary)]" :
            status === "completed" ? "border-green-500/30 bg-green-500/5" :
                "border-white/10 bg-card/50"), children: [_jsx("div", { className: cn("absolute top-0 left-0 w-full h-1 transition-all duration-500", status === "running" ? "bg-primary animate-pulse" :
                    status === "completed" ? "bg-green-500" :
                        "bg-transparent") }), _jsxs("div", { className: "p-5 flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: cn("p-2 rounded-lg", status === "running" ? "bg-primary/20 text-primary" :
                                    status === "completed" ? "bg-green-500/20 text-green-500" :
                                        "bg-white/5 text-muted-foreground"), children: _jsx(Icon, { className: "h-6 w-6" }) }), status === "running" && _jsx(Loader2, { className: "h-5 w-5 text-primary animate-spin" }), status === "completed" && _jsx(CheckCircle2, { className: "h-5 w-5 text-green-500" }), status === "idle" && _jsx("div", { className: "h-2 w-2 rounded-full bg-white/10" })] }), _jsx("h3", { className: "font-bold text-lg mb-1", children: title }), _jsx("p", { className: "text-sm text-muted-foreground mb-4 h-10 leading-tight", children: description }), _jsxs("div", { className: "flex-1 bg-black/50 rounded-lg border border-white/5 p-3 font-mono text-xs overflow-hidden flex flex-col min-h-[120px]", children: [_jsxs("div", { className: "flex items-center gap-2 border-b border-white/5 pb-2 mb-2 text-muted-foreground", children: [_jsx(Terminal, { className: "h-3 w-3" }), _jsx("span", { children: "AGENT_OUT" })] }), _jsxs("div", { ref: scrollRef, className: "overflow-y-auto flex-1 space-y-1 max-h-[100px] scrollbar-none", children: [logs.length === 0 ? (_jsx("span", { className: "text-muted-foreground/30 italic", children: "Waiting for task..." })) : (logs.map((log, i) => (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, className: "text-primary/80", children: [_jsx("span", { className: "text-muted-foreground mr-2", children: ">" }), log] }, i)))), status === "running" && (_jsx(motion.div, { animate: { opacity: [0, 1, 0] }, transition: { repeat: Infinity, duration: 0.8 }, className: "h-4 w-2 bg-primary/50 inline-block align-middle ml-1" }))] })] })] })] }));
}
export function AgentVisualizer({ isScanning, onScanComplete }) {
    const [agentStates, setAgentStates] = useState({
        parsing: "idle",
        rules: "idle",
        reasoning: "idle",
        reporting: "idle",
    });
    const [logs, setLogs] = useState({
        parsing: [],
        rules: [],
        reasoning: [],
        reporting: [],
    });
    useEffect(() => {
        if (!isScanning)
            return;
        // Reset
        setAgentStates({ parsing: "running", rules: "idle", reasoning: "idle", reporting: "idle" });
        setLogs({ parsing: [], rules: [], reasoning: [], reporting: [] });
        const addLog = (agent, message) => {
            setLogs(prev => ({ ...prev, [agent]: [...prev[agent], message] }));
        };
        // Simulation Timeline
        // Agent 1: Parsing
        setTimeout(() => addLog("parsing", "Initializing Tree-sitter parser..."), 500);
        setTimeout(() => addLog("parsing", "Generating AST for /src/auth.ts..."), 1500);
        setTimeout(() => addLog("parsing", "Constructing Control Flow Graph..."), 2500);
        setTimeout(() => {
            addLog("parsing", "Parsing complete. 14 files processed.");
            setAgentStates(prev => ({ ...prev, parsing: "completed", rules: "running" }));
        }, 3500);
        // Agent 2: Rule Engine
        setTimeout(() => addLog("rules", "Loading semantic security rules..."), 4000);
        setTimeout(() => addLog("rules", "Scanning for SQL Injection patterns..."), 5000);
        setTimeout(() => addLog("rules", "Checking taint analysis paths..."), 6000);
        setTimeout(() => addLog("rules", "DETECTED: Potential SQLi in login()"), 7000);
        setTimeout(() => {
            addLog("rules", "Rule execution finished. 3 findings.");
            setAgentStates(prev => ({ ...prev, rules: "completed", reasoning: "running" }));
        }, 8000);
        // Agent 3: Reasoning
        setTimeout(() => addLog("reasoning", "Analyzing context with GPT-4o-mini..."), 8500);
        setTimeout(() => addLog("reasoning", "Validating false positives..."), 9500);
        setTimeout(() => addLog("reasoning", "Generating fix for CWE-89..."), 10500);
        setTimeout(() => {
            addLog("reasoning", "Analysis complete. Fixes generated.");
            setAgentStates(prev => ({ ...prev, reasoning: "completed", reporting: "running" }));
        }, 11500);
        // Agent 4: Reporting
        setTimeout(() => addLog("reporting", "Compiling SARIF 2.1.0 report..."), 12000);
        setTimeout(() => addLog("reporting", "Generating dashboard summary..."), 13000);
        setTimeout(() => {
            addLog("reporting", "Report generated successfully.");
            setAgentStates(prev => ({ ...prev, reporting: "completed" }));
            onScanComplete();
        }, 14000);
    }, [isScanning]);
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full", children: [_jsx(AgentCard, { title: "Code Parsing Agent", description: "Parses source code into AST, CFG & DFG using Tree-sitter.", icon: FileSearch, status: agentStates.parsing, logs: logs.parsing }), _jsx(AgentCard, { title: "Rule Engine Agent", description: "Executes deterministic rules & taint analysis.", icon: ShieldCheck, status: agentStates.rules, logs: logs.rules }), _jsx(AgentCard, { title: "Reasoning Agent", description: "Validates findings & generates fixes with GPT-4o.", icon: Brain, status: agentStates.reasoning, logs: logs.reasoning }), _jsx(AgentCard, { title: "Reporting Agent", description: "Generates SARIF reports & PR comments.", icon: FileText, status: agentStates.reporting, logs: logs.reporting })] }));
}
//# sourceMappingURL=agent-visualizer.js.map
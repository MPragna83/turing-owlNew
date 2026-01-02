import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, Play, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
export function ScanInput({ onStart }) {
    const [url, setUrl] = useState("https://github.com/user/demo-vulnerable-app");
    return (_jsx("div", { className: "bg-card/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm mb-8", children: _jsxs("div", { className: "flex flex-col md:flex-row gap-4 items-end", children: [_jsxs("div", { className: "flex-1 w-full", children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground mb-2 block", children: "Target Repository" }), _jsxs("div", { className: "relative", children: [_jsx(Github, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { value: url, onChange: (e) => setUrl(e.target.value), className: "pl-9 bg-black/20 border-white/10 font-mono text-sm h-11 focus-visible:ring-primary/30", "data-testid": "input-repository-url" })] })] }), _jsx("div", { className: "w-full md:w-auto", children: _jsxs(Button, { size: "lg", className: "w-full md:w-auto h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary)]", onClick: () => onStart(url), "data-testid": "button-start-scan", children: [_jsx(Play, { className: "h-4 w-4 fill-current" }), "Start Autonomous Scan"] }) })] }) }));
}
//# sourceMappingURL=scan-input.js.map
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "wouter";
import { Shield, Activity, FileCode, Settings, Terminal, ShieldAlert, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
export default function Layout({ children }) {
    const [location] = useLocation();
    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        { icon: Activity, label: "Live Scan", href: "/scan" },
        { icon: ShieldAlert, label: "Vulnerabilities", href: "/findings" },
        { icon: FileCode, label: "Codebase", href: "/codebase" },
        { icon: Settings, label: "Settings", href: "/settings" },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20", children: [_jsxs("aside", { className: "w-64 border-r border-white/10 bg-card/50 backdrop-blur-xl fixed h-full z-50 flex flex-col", children: [_jsxs("div", { className: "p-6 flex items-center gap-3 border-b border-white/5", children: [_jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_-3px_var(--color-primary)]", children: _jsx(Shield, { className: "h-6 w-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-bold tracking-tight text-lg", children: "Agentic AI" }), _jsx("p", { className: "text-xs text-muted-foreground font-mono", children: "Security Platform" })] })] }), _jsx("nav", { className: "flex-1 p-4 space-y-2", children: navItems.map((item) => {
                            const isActive = location === item.href;
                            return (_jsx(Link, { href: item.href, children: _jsxs("div", { className: cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer group", isActive
                                        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_-5px_var(--color-primary)]"
                                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"), children: [_jsx(item.icon, { className: cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground") }), _jsx("span", { className: "font-medium", children: item.label })] }) }, item.href));
                        }) }), _jsx("div", { className: "p-4 border-t border-white/5", children: _jsxs("div", { className: "bg-black/40 rounded-lg p-3 border border-white/5", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-green-500 animate-pulse" }), _jsx("span", { className: "text-xs font-mono text-green-400", children: "System Operational" })] }), _jsx("div", { className: "text-xs text-muted-foreground font-mono", children: "v2.4.0-stable" })] }) })] }), _jsxs("main", { className: "flex-1 ml-64 relative", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" }), _jsx("div", { className: "relative z-10 p-8 max-w-7xl mx-auto", children: children })] })] }));
}
//# sourceMappingURL=layout.js.map
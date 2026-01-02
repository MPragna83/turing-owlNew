import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
export function useScan() {
    const [progress, setProgress] = useState(null);
    const wsRef = useRef(null);
    useEffect(() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${protocol}//${window.location.host}/api/scan/ws`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data);
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        wsRef.current = ws;
        return () => {
            ws.close();
        };
    }, []);
    const startScan = useMutation({
        mutationFn: async (repositoryUrl) => {
            const response = await fetch("/api/scan/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repositoryUrl }),
            });
            if (!response.ok) {
                throw new Error("Failed to start scan");
            }
            return response.json();
        },
    });
    return {
        startScan,
        progress,
    };
}
export function useVulnerabilities(scanId) {
    return useQuery({
        queryKey: ["vulnerabilities", scanId],
        queryFn: async () => {
            if (!scanId)
                return [];
            const response = await fetch(`/api/scan/${scanId}/vulnerabilities`);
            if (!response.ok) {
                throw new Error("Failed to fetch vulnerabilities");
            }
            return response.json();
        },
        enabled: !!scanId,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data)
                return false;
            return 2000;
        },
    });
}
export function useScanDetails(scanId) {
    return useQuery({
        queryKey: ["scan", scanId],
        queryFn: async () => {
            if (!scanId)
                return null;
            const response = await fetch(`/api/scan/${scanId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch scan details");
            }
            return response.json();
        },
        enabled: !!scanId,
        refetchInterval: 2000,
    });
}
//# sourceMappingURL=use-scan.js.map
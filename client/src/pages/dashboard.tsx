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
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);
  
  const { data: vulnerabilities = [] } = useVulnerabilities(currentScanId);
  const { data: scanDetails } = useScanDetails(currentScanId);

  const isScanning = progress?.status === "running";
  const scanComplete = progress?.status === "completed" || scanDetails?.status === "completed";

  useEffect(() => {
    if (progress?.scanId) {
      setCurrentScanId(progress.scanId);
    }
  }, [progress]);

  const handleStartScan = async (url: string) => {
    try {
      const result = await startScan.mutateAsync(url);
      setCurrentScanId(result.scanId);
    } catch (error) {
      console.error("Failed to start scan:", error);
    }
  };

  const criticalCount = vulnerabilities.filter((v: any) => v.severity === "critical").length;
  const highCount = vulnerabilities.filter((v: any) => v.severity === "high").length;

  return (
    <Layout>
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-black/0 to-background z-10" />
         <img 
           src={generatedImage} 
           alt="Background" 
           className="w-full h-[600px] object-cover opacity-20"
         />
      </div>

      <div className="relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 font-sans">Security Overview</h1>
          <p className="text-muted-foreground text-lg">
            Autonomous Agentic Vulnerability Analysis
          </p>
        </div>

        <ScanInput onStart={handleStartScan} />

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Active Agents
            </h2>
            {isScanning && <span className="text-xs font-mono text-primary animate-pulse">PROCESSING...</span>}
          </div>
          
          {progress ? (
            <LiveAgentVisualizer 
              currentAgent={progress.currentAgent}
              message={progress.message}
              progress={progress.progress}
            />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              Start a scan to see agents in action
            </div>
          )}
        </div>

        {scanComplete && vulnerabilities.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Security Findings</h2>
              <div className="flex gap-2">
                {criticalCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                    {criticalCount} Critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
                    {highCount} High
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {vulnerabilities.map((vuln: any, index: number) => (
                <VulnerabilityCard key={vuln.id} vuln={vuln} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

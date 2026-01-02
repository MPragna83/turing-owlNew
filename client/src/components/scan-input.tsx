import { Search, Play, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function ScanInput({ onStart }: { onStart: (url: string) => void }) {
  const [url, setUrl] = useState("https://github.com/user/demo-vulnerable-app");
  
  return (
    <div className="bg-card/30 border border-white/10 rounded-xl p-6 backdrop-blur-sm mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Target Repository
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 font-mono text-sm h-11 focus-visible:ring-primary/30"
              data-testid="input-repository-url"
            />
          </div>
        </div>
        <div className="w-full md:w-auto">
          <Button 
            size="lg" 
            className="w-full md:w-auto h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary)]"
            onClick={() => onStart(url)}
            data-testid="button-start-scan"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Autonomous Scan
          </Button>
        </div>
      </div>
    </div>
  );
}

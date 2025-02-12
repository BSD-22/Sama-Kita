import { Loader2 } from 'lucide-react';

type LoadingStage = {
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
};

export function GraphLoadingState({ stages }: { stages: LoadingStage[] }) {
  return (
    <div className="w-full h-[400px] bg-white rounded-lg border p-8">
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="space-y-4 w-full max-w-md">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-3">
              {stage.status === 'complete' ? (
                <div className="w-2 h-2 rounded-full bg-green-500" />
              ) : stage.status === 'error' ? (
                <div className="w-2 h-2 rounded-full bg-red-500" />
              ) : stage.status === 'loading' ? (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              )}
              <span className={`text-sm ${stage.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
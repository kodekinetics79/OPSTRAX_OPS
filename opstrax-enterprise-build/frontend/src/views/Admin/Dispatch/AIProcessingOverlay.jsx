import React, { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, Loader2, Sparkles, X } from "lucide-react";

const AIProcessingOverlay = ({ isVisible, onComplete, steps = [] }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (isVisible && steps.length > 0) {
      setCurrentStepIndex(0);
      setCompletedSteps([]);

      let stepTimeout;

      const processStep = (index) => {
        if (index >= steps.length) {
          setTimeout(() => {
            onComplete();
          }, 1000);
          return;
        }

        setCurrentStepIndex(index);

        // Random duration for each step to feel more "real" (800ms - 2000ms)
        const duration = Math.floor(Math.random() * 1200) + 800;

        stepTimeout = setTimeout(() => {
          setCompletedSteps((prev) => [...prev, index]);
          processStep(index + 1);
        }, duration);
      };

      processStep(0);

      return () => clearTimeout(stepTimeout);
    }
  }, [isVisible, steps, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed min-h-screen inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card-dark rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/10">
        {/* Header */}
        <div className="bg-primary/10 p-6 text-white text-center relative overflow-hidden border-b border-white/5">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(240,249,65,0.2)] animate-pulse border border-primary/20">
              <BrainCircuit size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              AI Optimization Engine
            </h2>
            <p className="text-soft-gray text-sm font-medium">
              Analyzing parameters for optimal route efficiency...
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = index === currentStepIndex;
            const isPending = !isCompleted && !isCurrent;

            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 border ${
                  isCurrent
                    ? "bg-white/5 border-primary/30 translate-x-2 shadow-[0_0_10px_rgba(240,249,65,0.1)]"
                    : "border-transparent opacity-70"
                }`}
              >
                <div className="mt-1 shrink-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center animate-scale-in border border-emerald-500/20">
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 text-primary flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-white/10 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-bold text-sm ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "text-white"
                          : "text-soft-gray/50"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <p className="text-xs text-primary/80 mt-1 animate-pulse font-medium">
                      Processing...
                    </p>
                  )}
                  {isCompleted && step.detail && (
                    <p className="text-xs text-soft-gray mt-1">{step.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIProcessingOverlay;

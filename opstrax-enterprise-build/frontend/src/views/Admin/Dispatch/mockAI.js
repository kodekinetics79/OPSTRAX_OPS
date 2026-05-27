// Mock AI Optimization Logic
// Simulates complex decision making without a real backend

export const generateSimulationSteps = () => [
  { 
    id: 1, 
    label: "Analyzing Vehicle Dimensions", 
    detail: "Checking height (3.8m) against low bridge data..." 
  },
  { 
    id: 2, 
    label: "Evaluating Load Constraints", 
    detail: "Verifying weight distribution and axle limits..." 
  },
  { 
    id: 3, 
    label: "Calculating Traffic Patterns", 
    detail: "Processing historical congestion data for 14:00-18:00..." 
  },
  { 
    id: 4, 
    label: "Optimizing Stop Sequence", 
    detail: "Reordering 2 stops to minimize left turns..." 
  },
  { 
    id: 5, 
    label: "Finalizing Route Path", 
    detail: "Generating turn-by-turn navigation instructions..." 
  }
];

export const simulateOptimization = async (formData) => {
  // Simulate processing delay
  // In a real app, this would be an API call
  
  const optimizedRoutes = formData.routes.map((route, index) => {
    // 1. Simulate "AI Reasoning" for the route leg
    let aiReasoning = "Standard efficient path selected.";
    const randomFactor = Math.random();
    
    if (randomFactor > 0.7) {
      aiReasoning = "Selected alternative highway to avoid predicted congestion.";
    } else if (randomFactor > 0.4) {
      aiReasoning = "Route optimized for fuel efficiency (Eco-Mode).";
    }

    // 2. Simulate "AI Reasoning" for stops
    const optimizedStops = route.stops?.map((stop, sIndex) => {
      let stopNote = stop.notes || "";
      if (Math.random() > 0.6) {
        stopNote = stopNote ? `${stopNote} (AI: Reordered)` : "AI: Sequence optimized for delivery window";
      }
      return {
        ...stop,
        notes: stopNote
      };
    });

    return {
      ...route,
      aiNote: aiReasoning,
      stops: optimizedStops,
      isOptimized: true
    };
  });

  // 3. Simulate "Global" optimization note
  const globalNote = formData.fillLevel > 90 
    ? "High utilization achieved. Load balancing active." 
    : "Capacity available for backhaul opportunities.";

  return {
    ...formData,
    routes: optimizedRoutes,
    aiGlobalNote: globalNote,
    optimizedAt: new Date().toISOString()
  };
};

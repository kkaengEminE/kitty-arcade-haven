import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FlappyCat from "./pages/FlappyCat";
import Othello from "./pages/Othello";
import Sokoban from "./pages/Sokoban";
import SnakeCat from "./pages/SnakeCat";
import PacmanHamster from "./pages/PacmanHamster";
import Cat2048 from "./pages/Cat2048";
import ArkanoidHamster from "./pages/ArkanoidHamster";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/flappy-cat" element={<FlappyCat />} />
          <Route path="/othello" element={<Othello />} />
          <Route path="/sokoban" element={<Sokoban />} />
          <Route path="/snake-cat" element={<SnakeCat />} />
          <Route path="/pacman-hamster" element={<PacmanHamster />} />
          <Route path="/cat-2048" element={<Cat2048 />} />
          <Route path="/arkanoid-hamster" element={<ArkanoidHamster />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

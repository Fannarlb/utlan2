import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './pages/Index';
import NewLoan from './pages/NewLoan';
import ActiveLoans from './pages/ActiveLoans';
import LoanHistory from './pages/LoanHistory';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter basename="/utlan2">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-loan" element={<NewLoan />} />
          <Route path="/active-loans" element={<ActiveLoans />} />
          <Route path="/loan-history" element={<LoanHistory />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

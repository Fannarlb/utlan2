import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PinGate } from '@/components/PinGate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Index from './pages/Index';
import NewLoan from './pages/NewLoan';
import ActiveLoans from './pages/ActiveLoans';
import LoanHistory from './pages/LoanHistory';
import ManageCars from './pages/ManageCars';
import ManageSalesmen from './pages/ManageSalesmen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <PinGate>
        <BrowserRouter basename="/utlan2">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-loan" element={<NewLoan />} />
            <Route path="/active-loans" element={<ActiveLoans />} />
            <Route path="/loan-history" element={<LoanHistory />} />
            <Route path="/manage-cars" element={<ManageCars />} />
            <Route path="/manage-salesmen" element={<ManageSalesmen />} />
          </Routes>
        </BrowserRouter>
      </PinGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

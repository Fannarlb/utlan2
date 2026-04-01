import { useNavigate } from 'react-router-dom';
import { Car, ClipboardList, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-blue-900 text-white px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Car className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Bílalánaskráning</h1>
        </div>
        <p className="text-blue-300 text-sm">Umsjón bílalána</p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">
        <Card
          className="cursor-pointer bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors active:scale-[0.98]"
          onClick={() => navigate('/new-loan')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Nýtt lán</h2>
              <p className="text-sm text-slate-400">
                Skrá nýtt bílalán á viðskiptavin
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors active:scale-[0.98]"
          onClick={() => navigate('/active-loans')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-amber-900/50 text-amber-400 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Virk lán</h2>
              <p className="text-sm text-slate-400">
                Skoða og skila útlánuðum bílum
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors active:scale-[0.98]"
          onClick={() => navigate('/loan-history')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Lánasaga</h2>
              <p className="text-sm text-slate-400">
                Leita og skoða öll fyrri lán
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
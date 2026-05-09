import { useNavigate } from 'react-router-dom';
import { Car, ClipboardList, History, Settings2, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ToyotaLogo } from '@/components/ToyotaLogo';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="bg-zinc-800 border-b border-zinc-700 px-4 py-6">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <ToyotaLogo className="w-16 h-11 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Bílalánaskráning</h1>
            <p className="text-zinc-400 text-sm">Umsjón bílalána</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-md mx-auto p-4 space-y-3 mt-2">
        <Card
          className="cursor-pointer bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors active:scale-[0.99]"
          onClick={() => navigate('/new-loan')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-zinc-700 text-white flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Nýtt lán</h2>
              <p className="text-sm text-zinc-400">Skrá nýtt bílalán á viðskiptavin</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors active:scale-[0.99]"
          onClick={() => navigate('/active-loans')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-zinc-700 text-white flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Virk lán</h2>
              <p className="text-sm text-zinc-400">Skoða og skila útlánuðum bílum</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors active:scale-[0.99]"
          onClick={() => navigate('/loan-history')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-zinc-700 text-white flex items-center justify-center flex-shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Lánasaga</h2>
              <p className="text-sm text-zinc-400">Leita og skoða öll fyrri lán</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors active:scale-[0.99]"
          onClick={() => navigate('/manage-cars')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-zinc-700 text-white flex items-center justify-center flex-shrink-0">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Bílastjórnun</h2>
              <p className="text-sm text-zinc-400">Bæta við og fjarlægja bíla</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-colors active:scale-[0.99]"
          onClick={() => navigate('/manage-salesmen')}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="w-12 h-12 bg-zinc-700 text-white flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sölumannastjórnun</h2>
              <p className="text-sm text-zinc-400">Bæta við og fjarlægja sölumenn</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

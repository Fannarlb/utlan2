import { useNavigate } from 'react-router-dom';
import { Car, ClipboardList, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Nýtt lán',
      description: 'Lána bíl til viðskiptavinar',
      icon: Car,
      path: '/new-loan',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      title: 'Virk lán',
      description: 'Skoða bíla sem eru útlánaðir',
      icon: ClipboardList,
      path: '/active-loans',
      color: 'bg-amber-600 hover:bg-amber-700',
    },
    {
      title: 'Lánasaga',
      description: 'Leita í öllum lánaskrám',
      icon: History,
      path: '/loan-history',
      color: 'bg-slate-600 hover:bg-slate-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-blue-800 text-white px-4 py-6">
        <h1 className="text-2xl font-bold text-center">Bílalánaskráning</h1>
        <p className="text-blue-200 text-center text-sm mt-1">
          Umsjón bílalána
        </p>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">
        {menuItems.map((item) => (
          <Card
            key={item.path}
            className="cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`${item.color} p-3 rounded-xl text-white flex-shrink-0`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h2>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
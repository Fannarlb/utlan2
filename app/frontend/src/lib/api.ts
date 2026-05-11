import { formatCSVDateTime, formatBCDateTime } from './format';

export interface Salesman {
  id: number;
  name: string;
}

export interface Car {
  id: number;
  license_plate: string;
}

export interface Loan {
  id: number;
  salesman_name: string;
  license_plate: string;
  customer_name: string;
  customer_kennitala: string;
  customer_phone: string;
  notes: string;
  checkout_time: string;
  returned: string;
  return_time: string | null;
}

const API_ROOT =
  import.meta.env.VITE_API_BASE_URL ?? 'https://utlan2-production.up.railway.app';
const API_BASE = `${API_ROOT}/api/v1/entities`;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() ?? 'GET';
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

interface ListResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export async function fetchSalesmen(): Promise<Salesman[]> {
  const data = await apiFetch<ListResponse<Salesman>>('/salesmen/all?limit=2000');
  return data.items.sort((a, b) => a.name.localeCompare(b.name, 'is'));
}

export async function addSalesman(name: string): Promise<Salesman> {
  const all = await fetchSalesmen();
  const duplicate = all.find((s) => s.name.toLowerCase() === name.trim().toLowerCase());
  if (duplicate) throw new Error('Sölumaður með þetta nafn er þegar skráður.');

  return apiFetch<Salesman>('/salesmen', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim() }),
  });
}

export async function removeSalesman(id: number): Promise<void> {
  const [salesmen, activeLoans] = await Promise.all([fetchSalesmen(), fetchActiveLoans()]);
  const salesman = salesmen.find((s) => s.id === id);
  if (!salesman) throw new Error('Sölumaður fannst ekki.');

  const hasActiveLoan = activeLoans.some((l) => l.salesman_name === salesman.name);
  if (hasActiveLoan) throw new Error('Ekki hægt að fjarlægja sölumann með virkt lán.');

  await apiFetch(`/salesmen/${id}`, { method: 'DELETE' });
}

export async function fetchAllCars(): Promise<Car[]> {
  const data = await apiFetch<ListResponse<Car>>('/cars/all?limit=2000');
  return data.items.sort((a, b) => a.license_plate.localeCompare(b.license_plate));
}

export async function addCar(licensePlate: string): Promise<Car> {
  const all = await fetchAllCars();
  const duplicate = all.find(
    (c) => c.license_plate.toLowerCase() === licensePlate.trim().toLowerCase()
  );
  if (duplicate) throw new Error('Bíll með þessa númeraplötu er þegar skráður.');

  return apiFetch<Car>('/cars', {
    method: 'POST',
    body: JSON.stringify({ license_plate: licensePlate.trim() }),
  });
}

export async function removeCar(id: number): Promise<void> {
  const [allCars, activeLoans] = await Promise.all([fetchAllCars(), fetchActiveLoans()]);
  const car = allCars.find((c) => c.id === id);
  if (!car) throw new Error('Bíll fannst ekki.');

  const hasActiveLoan = activeLoans.some((l) => l.license_plate === car.license_plate);
  if (hasActiveLoan) throw new Error('Ekki hægt að fjarlægja bíl sem er útlánað.');

  await apiFetch(`/cars/${id}`, { method: 'DELETE' });
}

export async function fetchCars(): Promise<Car[]> {
  const [allCars, activeLoans] = await Promise.all([fetchAllCars(), fetchActiveLoans()]);
  const activePlates = new Set(activeLoans.map((l) => l.license_plate));
  return allCars.filter((c) => !activePlates.has(c.license_plate));
}

export async function fetchActiveLoans(): Promise<Loan[]> {
  const data = await apiFetch<ListResponse<Loan>>('/loans/all?limit=2000');
  return data.items
    .filter((l) => l.returned === 'no')
    .sort((a, b) => new Date(b.checkout_time).getTime() - new Date(a.checkout_time).getTime());
}

export async function fetchAllLoans(): Promise<Loan[]> {
  const data = await apiFetch<ListResponse<Loan>>('/loans/all?limit=2000');
  return data.items.sort(
    (a, b) => new Date(b.checkout_time).getTime() - new Date(a.checkout_time).getTime()
  );
}

export async function createLoan(data: {
  salesman_name: string;
  license_plate: string;
  customer_name: string;
  customer_kennitala?: string;
  customer_phone: string;
  notes?: string;
}): Promise<Loan> {
  const activeLoans = await fetchActiveLoans();
  const alreadyOut = activeLoans.some((l) => l.license_plate === data.license_plate);
  if (alreadyOut) throw new Error('This car is already checked out.');

  return apiFetch<Loan>('/loans', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      customer_kennitala: data.customer_kennitala || '',
      notes: data.notes || '',
      checkout_time: new Date().toISOString(),
      returned: 'no',
      return_time: '',
    }),
  });
}

export async function markReturned(loanId: number): Promise<Loan> {
  return apiFetch<Loan>(`/loans/${loanId}`, {
    method: 'PUT',
    body: JSON.stringify({
      returned: 'yes',
      return_time: new Date().toISOString(),
    }),
  });
}

export function exportLoansToCSV(loans: Loan[]): void {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const headers = ['Auðkenni', 'Sölumaður', 'Númeraplata', 'Nafn viðskiptavinar', 'Kennitala', 'Sími', 'Útlánsdagur', 'Skilað', 'Skiladagur', 'Athugasemd'];
  const rows = loans.map((l) => [
    l.id,
    escape(l.salesman_name),
    escape(l.license_plate),
    escape(l.customer_name),
    escape(l.customer_kennitala),
    escape(l.customer_phone),
    escape(formatCSVDateTime(l.checkout_time)),
    l.returned === 'yes' ? 'Já' : 'Nei',
    escape(formatCSVDateTime(l.return_time)),
    escape(l.notes),
  ]);

  const csv = '﻿' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lanasaga-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLoansForBusinessCentral(loans: Loan[]): void {
  const escape = (val: string) => `"${(val ?? '').replace(/"/g, '""')}"`;

  const headers = [
    '(Do Not Modify) Reynsluakstur',
    '(Do Not Modify) Row Checksum',
    '(Do Not Modify) Breytt',
    'Ökutæki',
    'Eigandi',
    'Lykli skilað',
    'Stofnað',
  ];
  const rows = loans.map((l) => [
    '',
    '',
    '',
    escape(l.license_plate),
    escape(l.customer_name),
    escape(l.returned === 'yes' ? 'Já' : 'Nei'),
    escape(formatBCDateTime(l.checkout_time)),
  ]);

  const csv = '﻿' + [headers.map(escape).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reynsluakstur-bc-${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

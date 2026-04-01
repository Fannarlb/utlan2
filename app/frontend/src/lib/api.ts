import { createClient } from '@metagptx/web-sdk';

export const client = createClient();

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

const SALESMEN: Salesman[] = [
  { id: 1, name: 'ES' },
  { id: 2, name: 'FLB' },
  { id: 3, name: 'GMG' },
  { id: 4, name: 'GRI' },
  { id: 5, name: 'HÓ' },
  { id: 6, name: 'IJG' },
  { id: 7, name: 'KJE' },
];

const CARS: Car[] = [
  { id: 1, license_plate: 'AA123' },
  { id: 2, license_plate: 'AB456' },
  { id: 3, license_plate: 'AC789' },
  { id: 4, license_plate: 'AD012' },
  { id: 5, license_plate: 'AE345' },
];

export async function fetchSalesmen(): Promise<Salesman[]> {
  return SALESMEN.sort((a, b) => a.name.localeCompare(b.name, 'is'));
}

export async function fetchCars(): Promise<Car[]> {
  return CARS.sort((a, b) => a.license_plate.localeCompare(b.license_plate));
}

export async function fetchActiveLoans(): Promise<Loan[]> {
  const response = await client.entities.loans.query({
    query: { returned: 'no' },
    sort: '-checkout_time',
    limit: 200,
  });
  return response.data.items || [];
}

export async function fetchAllLoans(): Promise<Loan[]> {
  const response = await client.entities.loans.query({
    query: {},
    sort: '-checkout_time',
    limit: 500,
  });
  return response.data.items || [];
}

export async function createLoan(data: {
  salesman_name: string;
  license_plate: string;
  customer_name: string;
  customer_kennitala?: string;
  customer_phone: string;
  notes?: string;
}): Promise<Loan> {
  const now = new Date().toISOString();
  const response = await client.entities.loans.create({
    data: {
      ...data,
      customer_kennitala: data.customer_kennitala || '',
      notes: data.notes || '',
      checkout_time: now,
      returned: 'no',
      return_time: null,
    },
  });
  return response.data;
}

export async function markReturned(loanId: number): Promise<Loan> {
  const now = new Date().toISOString();
  const response = await client.entities.loans.update({
    id: String(loanId),
    data: {
      returned: 'yes',
      return_time: now,
    },
  });
  return response.data;
}

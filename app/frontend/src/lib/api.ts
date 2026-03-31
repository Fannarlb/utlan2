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
  customer_phone: string;
  checkout_time: string;
  returned: string;
  return_time: string | null;
}

export async function fetchSalesmen(): Promise<Salesman[]> {
  const response = await client.entities.salesmen.query({
    query: {},
    limit: 100,
  });
  return response.data.items || [];
}

export async function fetchCars(): Promise<Car[]> {
  const response = await client.entities.cars.query({
    query: {},
    limit: 100,
  });
  return response.data.items || [];
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
  customer_phone: string;
}): Promise<Loan> {
  const now = new Date().toISOString();
  const response = await client.entities.loans.create({
    data: {
      ...data,
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
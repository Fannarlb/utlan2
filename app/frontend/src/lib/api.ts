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

const STORAGE_KEYS = {
  salesmen: 'dealership_salesmen',
  cars: 'dealership_cars',
  loans: 'dealership_loans',
};

const DEFAULT_SALESMEN: Salesman[] = [
  { id: 1, name: 'ES' },
  { id: 2, name: 'FLB' },
  { id: 3, name: 'GMG' },
  { id: 4, name: 'GRI' },
  { id: 5, name: 'HÓ' },
  { id: 6, name: 'IJG' },
  { id: 7, name: 'KJE' },
];

const DEFAULT_CARS: Car[] = [
  { id: 1, license_plate: 'AA123' },
  { id: 2, license_plate: 'AB456' },
  { id: 3, license_plate: 'AC789' },
  { id: 4, license_plate: 'AD012' },
  { id: 5, license_plate: 'AE345' },
];

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSalesmen(): Salesman[] {
  return readFromStorage<Salesman[]>(STORAGE_KEYS.salesmen, DEFAULT_SALESMEN);
}

function getCars(): Car[] {
  return readFromStorage<Car[]>(STORAGE_KEYS.cars, DEFAULT_CARS);
}

function getLoans(): Loan[] {
  return readFromStorage<Loan[]>(STORAGE_KEYS.loans, []);
}

function saveLoans(loans: Loan[]): void {
  writeToStorage(STORAGE_KEYS.loans, loans);
}

function nextLoanId(loans: Loan[]): number {
  if (loans.length === 0) return 1;
  return Math.max(...loans.map((loan) => loan.id)) + 1;
}

export async function fetchSalesmen(): Promise<Salesman[]> {
  return getSalesmen().sort((a, b) => a.name.localeCompare(b.name, 'is'));
}

export async function fetchCars(): Promise<Car[]> {
  const cars = getCars();
  const loans = getLoans();

  const activeLoanPlates = new Set(
    loans
      .filter((loan) => loan.returned === 'no')
      .map((loan) => loan.license_plate)
  );

  return cars
    .filter((car) => !activeLoanPlates.has(car.license_plate))
    .sort((a, b) => a.license_plate.localeCompare(b.license_plate));
}

export async function fetchActiveLoans(): Promise<Loan[]> {
  return getLoans()
    .filter((loan) => loan.returned === 'no')
    .sort((a, b) => new Date(b.checkout_time).getTime() - new Date(a.checkout_time).getTime());
}

export async function fetchAllLoans(): Promise<Loan[]> {
  return getLoans().sort(
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
  const loans = getLoans();

  const alreadyOut = loans.some(
    (loan) => loan.license_plate === data.license_plate && loan.returned === 'no'
  );

  if (alreadyOut) {
    throw new Error('This car is already checked out.');
  }

  const newLoan: Loan = {
    id: nextLoanId(loans),
    salesman_name: data.salesman_name,
    license_plate: data.license_plate,
    customer_name: data.customer_name,
    customer_kennitala: data.customer_kennitala || '',
    customer_phone: data.customer_phone,
    notes: data.notes || '',
    checkout_time: new Date().toISOString(),
    returned: 'no',
    return_time: null,
  };

  const updatedLoans = [newLoan, ...loans];
  saveLoans(updatedLoans);

  return newLoan;
}

export async function markReturned(loanId: number): Promise<Loan> {
  const loans = getLoans();

  const loanIndex = loans.findIndex((loan) => loan.id === loanId);
  if (loanIndex === -1) {
    throw new Error('Loan not found.');
  }

  const updatedLoan: Loan = {
    ...loans[loanIndex],
    returned: 'yes',
    return_time: new Date().toISOString(),
  };

  loans[loanIndex] = updatedLoan;
  saveLoans(loans);

  return updatedLoan;
}

declare module 'date-fns' {
  export function format(date: Date | number, formatStr: string, options?: any): string;
  export function parseISO(dateString: string): Date;
  export function isValid(date: any): boolean;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function startOfDay(date: Date | number): Date;
  export function endOfDay(date: Date | number): Date;
  export function isSameDay(dateLeft: Date | number, dateRight: Date | number): boolean;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
  export function addMonths(date: Date | number, amount: number): Date;
  export function subMonths(date: Date | number, amount: number): Date;
  export function startOfMonth(date: Date | number): Date;
  export function endOfMonth(date: Date | number): Date;
  export function addYears(date: Date | number, amount: number): Date;
  export function subYears(date: Date | number, amount: number): Date;
  export function getYear(date: Date | number): number;
  export function getMonth(date: Date | number): number;
  export function getDate(date: Date | number): number;
  export function setYear(date: Date | number, year: number): Date;
  export function setMonth(date: Date | number, month: number): Date;
  export function setDate(date: Date | number, dayOfMonth: number): Date;
}

declare module 'date-fns/locale/pt-BR' {
  export const ptBR: any;
}

declare module 'date-fns/locale' {
  export const ptBR: any;
  export const enUS: any;
}
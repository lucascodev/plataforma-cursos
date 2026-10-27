import { z } from 'zod';

// Printed by the lab's check script; spaces and case do not matter.
export const labCodeSchema = z
  .string()
  .transform((value) => value.replace(/\s/g, '').toUpperCase())
  .pipe(z.string().regex(/^LAB-[A-Z0-9]{8}$/, 'O código tem o formato LAB-XXXXXXXX.'));

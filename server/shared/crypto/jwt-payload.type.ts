export interface JwtPayload {
  readonly sub?: string;
  readonly exp?: number;
  readonly role?: string;
}

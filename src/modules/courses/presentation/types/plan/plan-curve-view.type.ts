export interface PlanCurveView {
  readonly width: number;
  readonly height: number;
  readonly plotLeft: number;
  readonly plotRight: number;
  readonly plotBottom: number;
  readonly plannedPath: string;
  readonly point: { readonly x: number; readonly y: number; readonly plannedY: number };
  readonly xTicks: readonly { readonly x: number; readonly label: string }[];
  readonly yTicks: readonly { readonly y: number; readonly label: string }[];
}

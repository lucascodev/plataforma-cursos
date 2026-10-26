import type { PlanCurveView } from './plan/plan-curve-view.type';

export interface OverviewView {
  readonly percent: number;
  readonly currentModuleLabel: string;
  readonly paceText: string;
  readonly paceTone: 'ahead' | 'behind';
  readonly curve: PlanCurveView;
}

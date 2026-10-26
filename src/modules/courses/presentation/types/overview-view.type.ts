export interface OverviewView {
  readonly percent: number;
  readonly currentModuleLabel: string;
  readonly paceText: string;
  readonly paceTone: 'ahead' | 'behind';
}

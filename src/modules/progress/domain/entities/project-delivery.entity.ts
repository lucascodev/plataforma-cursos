export interface ProjectDelivery {
  readonly repoUrl: string;
  readonly demoUrl: string | null;
  readonly metrics: string;
  readonly deliveredAt: string;
}

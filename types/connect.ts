export interface ConnectStatus {
  onboarded: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  transfersActive: boolean;
  requirementsDue: string[];
}

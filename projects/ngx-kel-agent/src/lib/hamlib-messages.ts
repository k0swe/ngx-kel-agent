export interface HamlibRigState {
  /** Transceiver model name */
  model: string;
  /** Dial frequency of the "current" VFO in Hz */
  frequency: number;
  /** Mode name of the "current" VFO */
  mode: string;
  /** Width of the current passband filter in Hz */
  passbandWidthHz: number;
}

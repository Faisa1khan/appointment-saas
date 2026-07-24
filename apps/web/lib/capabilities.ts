export type Capability = 
  | 'user:profile'
  | 'user:security'
  | 'organization:settings'
  | 'organization:switch'
  | 'billing'
  | 'notifications'
  | 'help'
  | 'shortcuts';

export type CapabilityContext = Record<string, unknown>;

export interface CapabilityDefinition {
  status: 'complete' | 'planned' | 'in-progress';
  evaluate: (context?: CapabilityContext) => boolean;
}

export const CapabilityConfig: Record<Capability, CapabilityDefinition> = {
  // Implemented MVP features
  'user:profile': { status: 'complete', evaluate: () => true },
  'organization:settings': { status: 'complete', evaluate: () => true },

  // Unfinished features
  'user:security': { status: 'planned', evaluate: () => false },
  'organization:switch': { status: 'planned', evaluate: () => false },
  'billing': { status: 'planned', evaluate: () => false },
  'notifications': { status: 'planned', evaluate: () => false },
  'help': { status: 'planned', evaluate: () => false },
  'shortcuts': { status: 'planned', evaluate: () => false },
};

/**
 * Checks if a specific feature capability is enabled based on the provided context.
 */
export function hasCapability(capability: Capability, context?: CapabilityContext): boolean {
  const definition = CapabilityConfig[capability];
  if (!definition) return false;
  return definition.evaluate(context);
}

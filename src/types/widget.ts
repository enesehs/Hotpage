export interface WidgetProps {
  config?: Record<string, unknown>;
  onConfigChange?: (config: Record<string, unknown>) => void;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<WidgetProps>;
  defaultConfig?: Record<string, unknown>;
}

export type WidgetId = 'currency' | 'weather' | 'quotes' | 'rss' | 'pomodoro' | 'music' | 'calendar';

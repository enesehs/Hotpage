
const isDev = import.meta.env.DEV;

const styles = {
  info: 'color: #3b82f6; font-weight: bold',
  success: 'color: #10b981; font-weight: bold',
  warning: 'color: #f59e0b; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  debug: 'color: #8b5cf6; font-weight: bold',
  widget: 'color: #06b6d4; font-weight: bold',
};

const icons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  debug: '🔍',
  widget: '🧩',
};

class Logger {
  private prefix = '[HotPage]';

  info(component: string, message: string, ...args: any[]) {
    if (!isDev) return;
    console.log(
      `%c${this.prefix} ${icons.info} ${component}%c ${message}`,
      styles.info,
      'color: inherit',
      ...args
    );
  }

  success(component: string, message: string, ...args: any[]) {
    if (!isDev) return;
    console.log(
      `%c${this.prefix} ${icons.success} ${component}%c ${message}`,
      styles.success,
      'color: inherit',
      ...args
    );
  }

  warning(component: string, message: string, ...args: any[]) {
    console.warn(
      `%c${this.prefix} ${icons.warning} ${component}%c ${message}`,
      styles.warning,
      'color: inherit',
      ...args
    );
  }

  error(component: string, message: string, error?: Error | unknown, ...args: any[]) {
    console.error(
      `%c${this.prefix} ${icons.error} ${component}%c ${message}`,
      styles.error,
      'color: inherit',
      ...(error ? [error] : []),
      ...args
    );
  }

  debug(component: string, message: string, ...args: any[]) {
    if (!isDev) return;
    console.log(
      `%c${this.prefix} ${icons.debug} ${component}%c ${message}`,
      styles.debug,
      'color: inherit',
      ...args
    );
  }

  widget(widgetName: string, message: string, ...args: any[]) {
    if (!isDev) return;
    console.log(
      `%c${this.prefix} ${icons.widget} ${widgetName}%c ${message}`,
      styles.widget,
      'color: inherit',
      ...args
    );
  }

  group(title: string, callback: () => void) {
    if (!isDev) return;
    console.group(`${this.prefix} ${title}`);
    callback();
    console.groupEnd();
  }

  groupCollapsed(title: string, callback: () => void) {
    if (!isDev) return;
    console.groupCollapsed(`${this.prefix} ${title}`);
    callback();
    console.groupEnd();
  }

  table(component: string, data: any) {
    if (!isDev) return;
    console.log(`%c${this.prefix} ${component}`, styles.info);
    console.table(data);
  }

  time(label: string) {
    if (!isDev) return;
    console.time(`${this.prefix} ${label}`);
  }

  timeEnd(label: string) {
    if (!isDev) return;
    console.timeEnd(`${this.prefix} ${label}`);
  }
}

export const logger = new Logger();

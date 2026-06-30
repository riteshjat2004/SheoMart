class Logger {
  info(message: string): void {
    console.log(`ℹ️ ${message}`);
  }

  warn(message: string): void {
    console.warn(`⚠️ ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`❌ ${message}`);

    if (error) {
      console.error(error);
    }
  }
}

export const logger = new Logger();
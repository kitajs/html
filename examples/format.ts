import {
  type BackgroundCheckListener,
  type DetailedHealthCheck,
  type HealthCheckResult,
  type HealthChecker,
  type HealthCheckerMap,
  HealthStatus,
  type MedicusErrorLogger,
  type MedicusOption
} from './types';

/**
 * **Medicus**
 *
 * A flexible and agnostic health check library for Node.js.
 *
 * @example
 *
 * ```ts
 * import { Medicus, HealthStatus } from 'medicus';
 *
 * const medicus = new Medicus();
 *
 * // Add health checkers
 * medicus.addChecker({
 *   database() {
 *     // Custom health logic
 *     return HealthStatus.HEALTHY;
 *   },
 *   cache() {
 *     // Simulate an unhealthy status
 *     return HealthStatus.UNHEALTHY;
 *   }
 * });
 *
 * // Perform a health check
 * const result = await medicus.performCheck(true);
 * // {
 * //   status: 'UNHEALTHY',
 * //   services: {
 * //     database: { status: 'HEALTHY' },
 * //     cache: { status: 'UNHEALTHY' }
 * //   }
 * // }
 * ```
 *
 * @see https://medicus.js.org
 * @see https://github.com/arthurfiorette/medicus
 */
export class Medicus<Ctx = void> {
  /** The interval id of the background check if it's running */
  protected backgroundCheckTimer: NodeJS.Timeout | null = null;

  /**
   * A map of all the checkers that will be executed when the health check is run with the
   * key being the name of the checker
   */
  protected readonly checkers: Map<string, HealthChecker<Ctx>> = new Map();

  /**
   * The context that will be passed to all the checkers when they get executed> This
   * value can can be changed at any time.
   */
  public context: Ctx = null as Ctx;

  /**
   * The error logger function that will be called whenever an error occurs during the
   * execution of a health check> This value can can be changed at any time.
   */
  public errorLogger: MedicusErrorLogger | null = null;

  /**
   * The last health check result, this is updated every time a health check is run and
   * can be accessed with `getLastCheck`> This value can can be changed at any time.
   */
  public lastCheck: HealthCheckResult | null = null;

  /**
   * The background check defined by the constructor.> This value can can be changed at
   * any time.
   */
  public onBackgroundCheck: BackgroundCheckListener | null = null;

  constructor(options: MedicusOption<Ctx> = {}) {
    if (options.context) {
      this.context = options.context;
    }

    if (options.errorLogger) {
      this.errorLogger = options.errorLogger;
    }

    if (options.onBackgroundCheck) {
      this.onBackgroundCheck = options.onBackgroundCheck;
    }

    if (options.checkers) {
      this.addChecker(options.checkers);
    }

    if (options.backgroundCheckInterval) {
      this.startBackgroundCheck(options.backgroundCheckInterval);
    }
  }

  /** Adds a new checker to be executed when the health check is run */
  addChecker(checkers: HealthCheckerMap<Ctx>): void {
    for (const name in checkers) {
      if (this.checkers.has(name)) {
        throw new Error(`A checker with the name "${name}" is already registered`);
      }

      this.checkers.set(name, checkers[name]!);
    }
  }

  /** Returns an read-only iterator of all the checkers */
  listCheckers(): MapIterator<HealthChecker<Ctx>> {
    return this.checkers.values();
  }

  /**
   * Removes a checker from the list of checkers to be executed
   *
   * @returns `true` if all provided checkers were removed, `false` otherwise
   */
  removeChecker(...checkerNames: string[]): boolean {
    let allRemoved = true;

    for (const name of checkerNames) {
      const deleted = this.checkers.delete(name);

      if (!deleted) {
        allRemoved = false;
      }
    }

    return allRemoved;
  }

  /**
   * Returns a shallow copy of the last health check result with debug information if it's
   * set
   *
   * - `debug` defaults to `false`
   */
  getLastCheck(debug = false): HealthCheckResult | null {
    if (!this.lastCheck) {
      return null;
    }

    return {
      status: this.lastCheck.status,
      services: debug ? this.lastCheck.services : {}
    };
  }

  /**
   * Performs a health check and returns the result
   *
   * - `debug` defaults to `false`
   */
  async performCheck(debug = false): Promise<HealthCheckResult> {
    let status = HealthStatus.HEALTHY;
    const services: Record<string, DetailedHealthCheck> = {};

    for await (const [serviceName, result] of Array.from(
      this.checkers,
      this.mapChecker,
      this
    )) {
      if (result.status === HealthStatus.UNHEALTHY) {
        status = HealthStatus.UNHEALTHY;
      }

      services[serviceName] = result;
    }

    // updates the last check result
    this.lastCheck = {
      status,
      services
    };

    return this.getLastCheck(debug)!;
  }

  /** Simple helper function to yield the result of a health check */
  protected async mapChecker([name, checker]: [string, HealthChecker<Ctx>]) {
    return [name, await this.executeChecker(checker)] as const;
  }

  /**
   * Runs a single health check and returns the result
   *
   * **This function never throws**
   */
  protected async executeChecker(
    checker: HealthChecker<Ctx>
  ): Promise<DetailedHealthCheck> {
    try {
      const check = await checker(this.context!);

      switch (typeof check) {
        case 'string':
          return { status: check };
        case 'object':
          return check;
        default:
          return { status: HealthStatus.HEALTHY };
      }
    } catch (error) {
      this.errorLogger?.(error, checker.name);

      return {
        status: HealthStatus.UNHEALTHY,
        debug: { error: String(error) }
      };
    }
  }

  /**
   * Bound function to be passed as reference that performs the background check and calls
   * the `onBackgroundCheck` callback if it's set
   */
  protected static async performBackgroundCheck<Ctx>(
    this: void,
    self: Medicus<Ctx>
  ): Promise<void> {
    const result = await self.performCheck(true);

    // Calls the onBackgroundCheck callback if it's set
    if (self.onBackgroundCheck) {
      try {
        await self.onBackgroundCheck(result);
      } catch (error) {
        // nothing we can do if there isn't a logger
        self.errorLogger?.(error, 'onBackgroundCheck');
      }
    }

    // Runs the background check again with the same interval
    // unless it was manually removed
    self.backgroundCheckTimer?.refresh();
  }

  /** Starts the background check if it's not already running */
  startBackgroundCheck(interval: number) {
    if (
      // already running
      this.backgroundCheckTimer ||
      // invalid interval
      interval < 1
    ) {
      return;
    }

    // Un-refs the timer so it doesn't keep the process running
    this.backgroundCheckTimer = setTimeout(
      Medicus.performBackgroundCheck,
      interval,
      this
    ).unref();
  }

  /** Stops the background check if it's running */
  stopBackgroundCheck(): void {
    if (!this.backgroundCheckTimer) {
      return;
    }

    clearTimeout(this.backgroundCheckTimer)!;
    this.backgroundCheckTimer = null;
  }

  // to be used as `using medicus = new Medicus()`
  [Symbol.dispose]() {
    return this.stopBackgroundCheck();
  }
}

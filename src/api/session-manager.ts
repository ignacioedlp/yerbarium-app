import { tr } from "@/i18n/core";
import { ApiError } from "./client";
export type TokenPair = { access: string; refresh: string };
export class SessionManager {
  access: string | null = null;
  refreshToken: string | null = null;
  generation = 0;
  private pending: Promise<string> | null = null;
  private storageQueue: Promise<void> = Promise.resolve();
  constructor(
    private store: {
      set: (token: string) => Promise<void>;
      remove: () => Promise<void>;
    },
    private renew: (token: string) => Promise<TokenPair>,
    private changed: (hasSession: boolean) => void,
  ) {}
  private persist(action: () => Promise<void>) {
    const next = this.storageQueue.then(action, action);
    this.storageQueue = next.catch(() => undefined);
    return next;
  }
  hydrate(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
  async accept(tokens: TokenPair) {
    const generation = ++this.generation;
    this.pending = null;
    this.access = null;
    this.refreshToken = null;
    this.changed(false);
    await this.persist(() => this.store.set(tokens.refresh));
    if (generation !== this.generation) return false;
    this.access = tokens.access;
    this.refreshToken = tokens.refresh;
    this.changed(true);
    return true;
  }
  async clear() {
    this.generation++;
    this.access = null;
    this.refreshToken = null;
    this.pending = null;
    this.changed(false);
    await this.persist(() => this.store.remove());
  }
  refresh(): Promise<string> {
    if (this.pending) return this.pending;
    const token = this.refreshToken,
      generation = this.generation;
    if (!token)
      return Promise.reject(new ApiError("Ingresá para continuar.", 401));
    const promise = Promise.resolve().then(async () => {
      try {
        const pair = await this.renew(token);
        if (generation !== this.generation)
          throw new ApiError(tr("La sesión cambió."), 401);
        await this.persist(() => this.store.set(pair.refresh));
        if (generation !== this.generation)
          throw new ApiError(tr("La sesión cambió."), 401);
        this.access = pair.access;
        this.refreshToken = pair.refresh;
        this.changed(true);
        return pair.access;
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 401 &&
          generation === this.generation
        )
          await this.clear();
        throw error;
      } finally {
        if (this.pending === promise) this.pending = null;
      }
    });
    this.pending = promise;
    return promise;
  }
}

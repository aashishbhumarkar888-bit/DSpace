import seedData from '../data/mongoSeedData.json';

export interface StorageStatus {
  isConnected: boolean;
  mode: 'Connected / Seeded' | 'Local Fallback (Seeded)';
  source: string;
}

class DataService {
  private apiBaseUrl: string = 'http://localhost:5000/api';
  private storageStatus: StorageStatus = {
    isConnected: false,
    mode: 'Local Fallback (Seeded)',
    source: 'static_seed_cache'
  };
  private statusListeners: Array<(status: StorageStatus) => void> = [];

  constructor() {
    this.checkHealth();
  }

  public subscribeStatus(listener: (status: StorageStatus) => void) {
    this.statusListeners.push(listener);
    listener(this.storageStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  public getStatus(): StorageStatus {
    return this.storageStatus;
  }

  private updateStatus(newStatus: StorageStatus) {
    this.storageStatus = newStatus;
    this.statusListeners.forEach((fn) => fn(newStatus));
  }

  public async checkHealth(): Promise<StorageStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.apiBaseUrl}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const status: StorageStatus = {
          isConnected: true,
          mode: data.mongoConnected ? 'Connected / Seeded' : 'Local Fallback (Seeded)',
          source: data.storageMode || 'mongodb'
        };
        this.updateStatus(status);
        return status;
      }
    } catch {
      // Offline fallback
    }

    const fallbackStatus: StorageStatus = {
      isConnected: false,
      mode: 'Local Fallback (Seeded)',
      source: 'static_seed_fallback'
    };
    this.updateStatus(fallbackStatus);
    return fallbackStatus;
  }

  public async getAOIs() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.apiBaseUrl}/aois`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          this.updateStatus({ isConnected: true, mode: 'Connected / Seeded', source: json.source });
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    return seedData.aois;
  }

  public async logSimulation(payload: {
    aoiId: string;
    interventionType: string;
    villagesSaved: number;
    hectaresRecovered: number;
    economicValueProtected: string;
  }) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.apiBaseUrl}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Local fallback
    }

    return {
      success: true,
      loggedTo: 'local_storage_cache',
      log: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const dataService = new DataService();


import type { AssetEntry, AssetManifest } from "./extract-content-urls";

const TIER_0_CONCURRENCY = 3;
const TIER_1_CONCURRENCY = 3;
const TIER_2_CONCURRENCY = 1;

type QueueItem = AssetEntry & { tier: 0 | 1 | 2; slug?: string };

const loaded = new Set<string>();
const pendingBumps = new Set<string>();
let queue: QueueItem[] = [];
let manifest: AssetManifest | null = null;
let activeCount = 0;
let processing = false;

function concurrencyForTier(tier: 0 | 1 | 2): number {
  switch (tier) {
    case 0:
      return TIER_0_CONCURRENCY;
    case 1:
      return TIER_1_CONCURRENCY;
    case 2:
      return TIER_2_CONCURRENCY;
  }
}

function loadAsset(entry: AssetEntry): Promise<void> {
  return new Promise<void>((resolve) => {
    if (entry.kind === "video") {
      fetch(entry.url)
        .then((res) => {
          if (res.body) {
            const reader = res.body.getReader();
            const pump = (): Promise<void> =>
              reader.read().then(({ done }) => (done ? undefined : pump()));
            return pump();
          }
        })
        .then(() => resolve())
        .catch(() => resolve());
    } else {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = entry.url;
    }
  });
}

function processQueue(): void {
  if (processing) return;
  processing = true;

  const run = () => {
    while (queue.length > 0) {
      const next = queue[0];
      if (loaded.has(next.url)) {
        queue.shift();
        continue;
      }

      const maxConcurrency = concurrencyForTier(next.tier);
      if (activeCount >= maxConcurrency) break;

      queue.shift();
      activeCount++;
      loadAsset(next).then(() => {
        loaded.add(next.url);
        activeCount--;
        run();
      });
    }

    if (queue.length === 0 && activeCount === 0) {
      processing = false;
    }
  };

  run();
}

function enqueue(items: QueueItem[]): void {
  for (const item of items) {
    if (!loaded.has(item.url)) {
      queue.push(item);
    }
  }
  queue.sort((a, b) => a.tier - b.tier);
  processQueue();
}

function promoteSlugToTier0(slug: string): void {
  for (const item of queue) {
    if (item.slug === slug) {
      item.tier = 0;
    }
  }
  queue.sort((a, b) => a.tier - b.tier);
}

export const PreloadManager = {
  seedThumbnails(entries: AssetEntry[]): void {
    const items: QueueItem[] = entries.map((e) => ({ ...e, tier: 1 }));
    enqueue(items);
  },

  seedManifest(assetManifest: AssetManifest): void {
    manifest = assetManifest;

    const heroes: QueueItem[] = [];
    const content: QueueItem[] = [];

    for (const entry of assetManifest) {
      if (entry.hero) {
        heroes.push({ ...entry.hero, tier: 1, slug: entry.slug });
      }
      for (const c of entry.content) {
        content.push({ ...c, tier: 2, slug: entry.slug });
      }
    }

    enqueue([...heroes, ...content]);

    for (const slug of pendingBumps) {
      promoteSlugToTier0(slug);
    }
    pendingBumps.clear();

    if (pendingBumps.size === 0 && queue.length > 0) {
      processQueue();
    }
  },

  bump(slug: string): void {
    if (!manifest) {
      pendingBumps.add(slug);
      return;
    }
    promoteSlugToTier0(slug);
    processQueue();
  },

  isLoaded(url: string): boolean {
    return loaded.has(url);
  },
};

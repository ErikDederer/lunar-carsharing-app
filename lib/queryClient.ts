import { QueryClient } from '@tanstack/react-query';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

let activeClient: QueryClient | null = null;

export function setActiveQueryClient(client: QueryClient): void {
  activeClient = client;
}

export function clearQueryCache(): void {
  const client = activeClient;
  if (!client) return;
  // Never call client.clear() here: it also removes queries that are on screen
  // or still in flight (e.g. the public car list on the landing page). Their
  // observers then never receive the response, so the hero card stays empty
  // when a visitor with an expired session opens the page.
  client.removeQueries({ type: 'inactive' });
  void client.invalidateQueries({ type: 'active', refetchType: 'none' });
  // Once React re-renders without the user, user-scoped queries become
  // inactive — drop them on the next tick.
  setTimeout(() => client.removeQueries({ type: 'inactive' }), 0);
}

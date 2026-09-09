import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type { Agent } from '@/types'
import { getRealAgentById, saveRealAgent } from '@/features/data/realDataStore'

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: ['agents', agentId],
    queryFn: async () => {
      try {
        const remote = await apiGet<Agent>(`/agents/${agentId}`)
        if (remote && remote.id) {
          saveRealAgent(remote)
          return remote
        }
      } catch (err) {
        console.warn('[useAgent] Remote API not reachable, querying persistent store:', err)
      }

      // Check realDataStore
      const local = getRealAgentById(agentId)
      if (local) return local

      // Create fallback baseline agent object so overview never crashes
      const fallback: Agent = {
        id: agentId,
        organizationId: 'org_main',
        name: 'AI Agent',
        description: 'Knowledge assistant',
        slug: `agent-${agentId.slice(0, 6)}`,
        status: 'draft',
        language: 'en',
        currentVersion: 1,
        knowledgeSourceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      saveRealAgent(fallback)
      return fallback
    },
    enabled: !!agentId,
    staleTime: 1000 * 15,
  })
}

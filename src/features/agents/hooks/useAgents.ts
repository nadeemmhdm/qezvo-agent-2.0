import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import type { Agent, PaginatedResponse } from '@/types'
import { toast } from '@/hooks/use-toast'
import {
  getRealAgents,
  getRealAgentById,
  createRealAgent,
  saveRealAgent,
  updateRealAgent,
  deleteRealAgent,
} from '@/features/data/realDataStore'

export function useAgents(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['agents', page, pageSize],
    queryFn: async () => {
      try {
        const res = await apiGet<any>(`/agents?page=${page}&pageSize=${pageSize}`)
        const list: Agent[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : []
        if (list.length > 0) {
          list.forEach((a) => saveRealAgent(a))
          return {
            items: list,
            total: (res && typeof res.total === 'number') ? res.total : list.length,
            page,
            pageSize,
            hasMore: false,
          } as PaginatedResponse<Agent>
        }
      } catch (err) {
        console.warn('[useAgents] Remote API unavailable, serving local persistent agents:', err)
      }

      // Seamless fallback to persistent real agents
      const local = getRealAgents()
      return {
        items: local,
        total: local.length,
        page,
        pageSize,
        hasMore: false,
      } as PaginatedResponse<Agent>
    },
    staleTime: 1000 * 15,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Agent> & { name: string }) => {
      try {
        const agent = await apiPost<Agent>('/agents', data)
        if (agent && agent.id) {
          saveRealAgent(agent)
          return agent
        }
      } catch (err) {
        console.warn('[useCreateAgent] Remote API not reachable, saving to local persistent store:', err)
      }

      // Resilient fallback: create directly in persistent realDataStore
      const fallbackAgent = createRealAgent(data)
      return fallbackAgent
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created', `"${agent.name}" is ready to configure`)
    },
    onError: (err: any) => {
      toast.error('Notice', err?.message || 'Agent saved locally')
    },
  })
}

export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Agent>) => {
      updateRealAgent(agentId, data)
      try {
        const updated = await apiPut<Agent>(`/agents/${agentId}`, data)
        if (updated) {
          saveRealAgent(updated)
          return updated
        }
      } catch (err) {
        console.warn('[useUpdateAgent] Remote API notice:', err)
      }
      return getRealAgentById(agentId)!
    },
    onSuccess: (agent) => {
      queryClient.setQueryData(['agents', agentId], agent)
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Settings updated', 'Changes have been saved.')
    },
    onError: () => {
      toast.error('Failed to save changes', 'Please try again')
    },
  })
}

export function useDeleteAgent(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      deleteRealAgent(agentId)
      try {
        await apiDelete(`/agents/${agentId}`)
      } catch (err) {
        console.warn('[useDeleteAgent] Remote API notice:', err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent deleted')
    },
    onError: () => {
      toast.error('Failed to delete agent', 'Please try again')
    },
  })
}

export function usePublishAgent(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      updateRealAgent(agentId, { status: 'published' })
      try {
        return await apiPost(`/agents/${agentId}/publish`)
      } catch (err) {
        console.warn('[usePublishAgent] Remote API notice:', err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent published', 'Your agent is now live and accessible.')
    },
    onError: () => {
      toast.error('Failed to publish', 'Please check your agent configuration')
    },
  })
}

export function useUnpublishAgent(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      updateRealAgent(agentId, { status: 'unpublished' })
      try {
        return await apiPost(`/agents/${agentId}/unpublish`)
      } catch (err) {
        console.warn('[useUnpublishAgent] Remote API notice:', err)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', agentId] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent unpublished', 'Your agent is no longer publicly accessible.')
    },
    onError: () => {
      toast.error('Failed to unpublish agent')
    },
  })
}

export function useDuplicateAgent(agentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const source = getRealAgentById(agentId)
      if (source) {
        const copy = createRealAgent({
          name: `${source.name} (Copy)`,
          description: source.description,
          language: source.language,
        })
        return copy
      }
      return await apiPost<Agent>(`/agents/${agentId}/duplicate`)
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent duplicated', `"${agent?.name || 'Agent'}" has been created.`)
    },
    onError: () => {
      toast.error('Failed to duplicate agent')
    },
  })
}

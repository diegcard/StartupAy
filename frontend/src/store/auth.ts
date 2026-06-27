import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Agent } from '../types'

interface AuthState {
  token: string | null
  agent: Pick<Agent, 'id' | 'name' | 'email' | 'role'> | null
  setAuth: (token: string, agent: AuthState['agent']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      agent: null,
      setAuth: (token, agent) => {
        localStorage.setItem('token', token)
        set({ token, agent })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, agent: null })
      },
    }),
    { name: 'auth' }
  )
)

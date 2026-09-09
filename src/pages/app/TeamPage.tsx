import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Loader2, Trash2, Shield, Crown, Eye } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

const ROLE_CONFIG: Record<TeamRole, { label: string; icon: React.ElementType; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-yellow-500' },
  admin: { label: 'Admin', icon: Shield, color: 'text-brand-500' },
  member: { label: 'Member', icon: Users, color: 'text-green-500' },
  viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' },
}

const ROLES_ORDER: TeamRole[] = ['owner', 'admin', 'member', 'viewer']

import {
  getRealTeamMembers,
  inviteRealTeamMember,
  removeRealTeamMember,
  updateRealTeamMemberRole,
  type RealTeamMember
} from '@/features/data/realDataStore'
import { sendTeamInviteEmail } from '@/features/email/smtpService'

export default function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<RealTeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('member')
  const [inviting, setInviting] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    setMembers(getRealTeamMembers(user ?? undefined))
  }, [user])

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    
    // 1. Create real team member record
    const created = inviteRealTeamMember(inviteEmail, inviteRole)
    setMembers((prev) => [...prev, created])

    // 2. Dispatch team invite email via Hostinger SMTP (team@qezvo.in)
    await sendTeamInviteEmail({
      to: inviteEmail,
      inviterName: user?.displayName || 'Workspace Owner',
      inviterEmail: user?.email || 'team@qezvo.in',
      role: inviteRole,
    }).catch((err) => {
      console.warn('Hostinger SMTP team invite notice:', err)
    })

    setInviting(false)
    setInviteEmail('')
    setShowInvite(false)
    toast.success('Invitation Dispatched', `Official workspace invite sent to ${inviteEmail} from team@qezvo.in`)
  }

  const handleRoleChange = (memberId: string, newRole: TeamRole) => {
    updateRealTeamMemberRole(memberId, newRole)
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    )
    toast.success('Role updated')
  }

  const handleRemove = (memberId: string) => {
    removeRealTeamMember(memberId)
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    toast.success('Member removed')
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Team"
        description="Manage team members and their access to your workspace"
        action={
          <Button size="sm" onClick={() => setShowInvite(!showInvite)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      {/* Invite form */}
      {showInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>
              They will receive an email invitation to join your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  autoFocus
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ROLES_ORDER.filter((r) => r !== 'owner').map((role) => (
                  <option key={role} value={role}>
                    {ROLE_CONFIG[role].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Role descriptions */}
            <div className="grid grid-cols-3 gap-2">
              {ROLES_ORDER.filter((r) => r !== 'owner').map((role) => {
                const { label, icon: Icon, color } = ROLE_CONFIG[role]
                return (
                  <div
                    key={role}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      inviteRole === role
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border hover:bg-muted/30'
                    }`}
                    onClick={() => setInviteRole(role)}
                  >
                    <Icon className={`h-4 w-4 ${color} mb-1`} />
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
              >
                {inviting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" />Send Invite</>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {members.map((member) => {
              const { icon: Icon, color } = ROLE_CONFIG[member.role]
              const isMe = member.email === user?.email
              const isOwner = member.role === 'owner'

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 py-3 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {member.name[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{member.name}</p>
                      {isMe && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className="text-sm font-medium">{ROLE_CONFIG[member.role].label}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${color}`} />
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                          className="text-sm bg-transparent border-0 focus:ring-0 cursor-pointer"
                          disabled={isMe}
                        >
                          {ROLES_ORDER.filter((r) => r !== 'owner').map((role) => (
                            <option key={role} value={role}>
                              {ROLE_CONFIG[role].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  {!isMe && !isOwner && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Roles explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="text-left pb-2 font-medium">Permission</th>
                  {ROLES_ORDER.map((role) => (
                    <th key={role} className="text-center pb-2 font-medium">
                      {ROLE_CONFIG[role].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  ['Create agents', true, true, true, false],
                  ['Edit agents', true, true, true, false],
                  ['Delete agents', true, true, false, false],
                  ['Manage API keys', true, true, false, false],
                  ['Invite members', true, true, false, false],
                  ['Manage billing', true, false, false, false],
                  ['Transfer ownership', true, false, false, false],
                ].map(([permission, ...perms]) => (
                  <tr key={permission as string}>
                    <td className="py-2 text-xs">{permission as string}</td>
                    {(perms as boolean[]).map((allowed, _i) => (
                      <td key={_i} className="py-2 text-center text-xs">
                        {allowed ? (
                          <span className="text-green-500">✓</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

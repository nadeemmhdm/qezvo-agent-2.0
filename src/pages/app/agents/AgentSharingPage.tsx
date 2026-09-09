import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Share2, Copy, ExternalLink, Globe, Link2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

export default function AgentSharingPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [customSlug, setCustomSlug] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.qezvo.in'
  const publicUrl = `${baseUrl}/a/${agentId}`

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success('URL copied to clipboard')
  }

  const shareOptions = [
    {
      id: 'direct',
      icon: Link2,
      label: 'Direct Link',
      description: 'Share the agent URL directly with users',
      url: publicUrl,
    },
    {
      id: 'iframe',
      icon: Globe,
      label: 'Embed (iframe)',
      description: 'Embed your agent in any website using an iframe',
      url: `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" title="Qezvo AI Agent"></iframe>`,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Sharing"
        description="Share your agent with others or embed it in your website"
      />

      {/* Public URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Public Agent URL
          </CardTitle>
          <CardDescription>
            Share this link so users can interact with your agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button variant="outline" size="icon" onClick={copyUrl} title="Copy URL">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild title="Open in new tab">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <Badge variant="secondary">Published</Badge>
        </CardContent>
      </Card>

      {/* Custom Slug */}
      <Card>
        <CardHeader>
          <CardTitle>Custom URL Slug</CardTitle>
          <CardDescription>
            Create a branded, memorable URL for your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              qezvo.in/a/
            </span>
            <Input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-support-bot"
              className="font-mono"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (customSlug) {
                  toast.success('Slug saved (simulation)')
                }
              }}
            >
              Save
            </Button>
          </div>
          {customSlug && (
            <p className="text-xs text-muted-foreground mt-2">
              Your URL: <span className="font-mono text-foreground">{baseUrl}/a/{customSlug}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Share Options */}
      <div className="space-y-3">
        {shareOptions.map((option) => {
          const Icon = option.icon
          return (
            <Card key={option.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4" />
                  {option.label}
                </CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={option.url}
                    readOnly
                    className="font-mono text-xs bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(option.url)
                      toast.success(`${option.label} copied`)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* QR Code placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR Code
          </CardTitle>
          <CardDescription>
            Let users scan a QR code to access your agent on mobile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-32 h-32 bg-muted border border-border rounded-lg flex items-center justify-center text-muted-foreground">
            <QrCode className="h-12 w-12 opacity-30" />
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            Download QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

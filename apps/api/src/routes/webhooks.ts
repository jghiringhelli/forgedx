import { Hono } from 'hono'
import { Webhook } from 'svix'
import type { PrismaClient } from '@prisma/client'

type UserEventData = { id: string; email_addresses: { email_address: string }[]; first_name?: string; last_name?: string }
type OrgEventData = { id: string; name: string; slug?: string }
type MembershipEventData = { organization: { id: string }; public_user_data: { user_id: string }; role: string }

// Strictly typed discriminated union — no catch-all to preserve narrowing
type WebhookEvent =
  | { type: 'user.created'; data: UserEventData }
  | { type: 'user.updated'; data: UserEventData }
  | { type: 'organization.created'; data: OrgEventData }
  | { type: 'organizationMembership.created'; data: MembershipEventData }

type RawWebhookEvent = { type: string; data: unknown }

export function webhookRoutes(prisma: PrismaClient) {
  const app = new Hono()

  app.post('/clerk', async (c) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET
    if (!secret) {
      console.error('[WEBHOOK] CLERK_WEBHOOK_SECRET not set')
      return c.json({ error: 'Webhook secret not configured' }, 500)
    }

    const body = await c.req.text()
    const svixId = c.req.header('svix-id')
    const svixTimestamp = c.req.header('svix-timestamp')
    const svixSignature = c.req.header('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return c.json({ error: 'Missing svix headers', code: 'INVALID_SIGNATURE' }, 400)
    }

    let event: RawWebhookEvent
    try {
      const wh = new Webhook(secret)
      event = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
        }) as RawWebhookEvent
    } catch {
      return c.json({ error: 'Invalid webhook signature', code: 'INVALID_SIGNATURE' }, 400)
    }

      const knownTypes = ['user.created', 'user.updated', 'organization.created', 'organizationMembership.created']
      if (!knownTypes.includes(event.type)) {
        return c.json({ received: true }) // ignore unknown event types
      }

      try {
        await handleEvent(event as unknown as WebhookEvent, prisma)
    } catch (err) {
      console.error('[WEBHOOK] Handler error:', err)
      return c.json({ error: 'Webhook handler failed' }, 500)
    }

    return c.json({ received: true })
  })

  return app
}

async function handleEvent(event: WebhookEvent, prisma: PrismaClient) {
  switch (event.type) {
    case 'user.created':
    case 'user.updated': {
      const { id, email_addresses, first_name, last_name } = event.data
      const email = email_addresses[0]?.email_address ?? ''
      const name = [first_name, last_name].filter(Boolean).join(' ') || null
      await prisma.user.upsert({
        where: { clerkId: id },
        create: { clerkId: id, email, name },
        update: { email, name },
      })
      break
    }
    case 'organization.created': {
      const { id, name, slug } = event.data
      await prisma.organization.upsert({
        where: { clerkId: id },
        create: { clerkId: id, name, slug },
        update: { name, slug },
      })
      break
    }
    case 'organizationMembership.created': {
      const { organization, public_user_data, role } = event.data
      const user = await prisma.user.findUnique({ where: { clerkId: public_user_data.user_id } })
      const org = await prisma.organization.findUnique({ where: { clerkId: organization.id } })
      if (user && org) {
        await prisma.organizationMember.upsert({
          where: { userId_orgId: { userId: user.id, orgId: org.id } },
          create: { userId: user.id, orgId: org.id, role },
          update: { role },
        })
      }
      break
    }
    default:
      // Ignore other event types
      break
  }
}

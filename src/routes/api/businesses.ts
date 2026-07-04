import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db'
import { businesses } from '../../db/schema'
import { getCurrentUser } from '../../lib/get-current-user'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/businesses')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getCurrentUser()
        if (!user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const userBusinesses = await db
          .select()
          .from(businesses)
          .where(eq(businesses.userId, user.id))

        return Response.json(userBusinesses)
      },
      POST: async ({ request }) => {
        const user = await getCurrentUser()
        if (!user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const data = await request.json()
        const [newBusiness] = await db
          .insert(businesses)
          .values({
            userId: user.id,
            name: data.name,
            phone: data.phone,
            address: data.address,
            industry: data.industry,
          })
          .returning()

        return Response.json(newBusiness)
      },
    },
  },
})

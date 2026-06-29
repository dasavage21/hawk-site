import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db'
import { businesses } from '../../../db/schema'
import { getCurrentUser } from '../../../lib/get-current-user'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const user = await getCurrentUser()
          if (!user) {
            return Response.json({ user: null }, { status: 401 })
          }

          const userBusinesses = await db
            .select()
            .from(businesses)
            .where(eq(businesses.userId, user.id))

          return Response.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            businesses: userBusinesses,
          })
        } catch (error) {
          console.error('Me API error:', error)
          return Response.json({ user: null }, { status: 500 })
        }
      },
    },
  },
})

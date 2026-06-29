import { createFileRoute } from '@tanstack/react-router'
import { compare } from 'bcryptjs'
import { db } from '../../../db'
import { users } from '../../../db/schema'
import { encrypt } from '../../../lib/session'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json()
          
          if (!data.email || !data.password) {
            return new Response('Missing email or password', { status: 400 })
          }

          const user = await db.query.users.findFirst({
            where: eq(users.email, data.email),
          })

          if (!user || !(await compare(data.password, user.passwordHash))) {
            return Response.json({ success: false, error: 'Invalid email or password' }, { status: 401 })
          }

          const session = await encrypt({ userId: user.id })

          return Response.json(
            { 
              success: true, 
              user: { id: user.id, email: user.email, name: user.name } 
            },
            {
              headers: {
                'Set-Cookie': `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`,
              },
            }
          )
        } catch (error: any) {
          console.error('Login API error:', error)
          return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})

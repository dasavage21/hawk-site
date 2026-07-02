import { createFileRoute } from '@tanstack/react-router'
import { hash } from 'bcryptjs'
import { db } from '../../../db'
import { users, businesses } from '../../../db/schema'
import { encrypt } from '../../../lib/session'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/auth/signup')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json()
          
          if (!data.email || !data.password || !data.businessName) {
            return new Response('Missing required fields', { status: 400 })
          }

          // Check if user exists
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, data.email),
          })

          if (existingUser) {
            return Response.json({ success: false, error: 'User already exists' }, { status: 400 })
          }

          const passwordHash = await hash(data.password, 10)

          const result = await db.transaction(async (tx) => {
            const [newUser] = await tx
              .insert(users)
              .values({
                email: data.email,
                passwordHash,
                name: data.businessName,
              })
              .returning()

            const [newBusiness] = await tx
              .insert(businesses)
              .values({
                userId: newUser.id,
                name: data.businessName,
              })
              .returning()

            return { user: newUser, business: newBusiness }
          })

          const session = await encrypt({ userId: result.user.id })
          
          return Response.json(
            { 
              success: true, 
              user: { id: result.user.id, email: result.user.email, name: result.user.name } 
            },
            {
              headers: {
                'Set-Cookie': `session=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 7}`,
              },
            }
          )
        } catch (error: any) {
          console.error('Signup API error:', error)
          return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
        }
      },
    },
  },
})

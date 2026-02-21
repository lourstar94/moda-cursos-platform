// scripts/create-admin.ts
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@moda.com',
        name: 'Diseñadora Principal',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Administradora creada:', admin)
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creando administradora:', error)
    process.exit(1)
  }
}

createAdmin()
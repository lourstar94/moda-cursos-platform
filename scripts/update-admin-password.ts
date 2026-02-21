// scripts/update-admin-password.ts
import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function updateAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@moda.com' },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Contraseña de administradora actualizada con hash')
    console.log('Email:', updatedAdmin.email)
    console.log('Rol:', updatedAdmin.role)
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
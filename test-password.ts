import bcrypt from 'bcryptjs'

async function testPassword() {
  const plainPassword = '123456'
  // Reemplaza con el hash que obtuviste de la BD
  const hashFromDB = '$2a$12$S9dFZhAh.DEvG7rV5.2GHD..mOiO0sbvjw8XhHuBTWkic/p8d.DN/q' 
  
  const isValid = await bcrypt.compare(plainPassword, hashFromDB)
  console.log('¿La contraseña es válida?', isValid)
  
  // Generar un nuevo hash para comparar
  const newHash = await bcrypt.hash(plainPassword, 12)
  console.log('Nuevo hash generado:', newHash)
}

testPassword()
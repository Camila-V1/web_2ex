// Script para verificar si el endpoint /api/users/me/ existe
// Ejecutar esto en la consola del navegador (F12) después de hacer login

async function testUserMeEndpoint() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.error('❌ No hay token. Haz login primero.');
    return;
  }

  console.log('🔍 Probando endpoint /api/users/me/...');
  console.log('Token:', token.substring(0, 20) + '...');

  try {
    const response = await fetch('http://localhost:8000/api/users/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Endpoint existe! Datos recibidos:');
      console.log(data);
      console.log('\n📊 Información del usuario:');
      console.log('  Username:', data.username);
      console.log('  Email:', data.email);
      console.log('  is_staff:', data.is_staff);
      console.log('  is_superuser:', data.is_superuser);
      
      if (data.is_staff) {
        console.log('\n✅ Este usuario ES administrador');
      } else {
        console.log('\n⚠️ Este usuario NO es administrador');
      }
    } else if (response.status === 404) {
      console.error('❌ Endpoint NO existe (404)');
      console.error('El backend necesita implementar GET /api/users/me/');
      console.error('Ver instrucciones en FIX_ADMIN_REDIRECT.md');
    } else if (response.status === 401) {
      console.error('❌ Token inválido o expirado (401)');
      console.error('Haz login nuevamente');
    } else {
      const errorData = await response.text();
      console.error(`❌ Error ${response.status}:`, errorData);
    }
  } catch (error) {
    console.error('❌ Error de red:', error);
    console.error('Asegúrate de que el backend esté corriendo en http://localhost:8000');
  }
}

// Ejecutar la prueba
testUserMeEndpoint();

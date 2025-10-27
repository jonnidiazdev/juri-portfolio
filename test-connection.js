// Script de prueba rápida para verificar conexión IOL
import axios from 'axios'

const testEndpoints = async () => {
  console.log('🧪 Testing IOL Backend Connection\n')
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Health Check...')
    const health = await axios.get('http://localhost:4000/api/health')
    console.log('✅ Health:', health.data)
    console.log()
    
    // Test 2: Quote GGAL
    console.log('2️⃣ Getting GGAL quote...')
    const ggal = await axios.get('http://localhost:4000/api/iol/quote/acciones/GGAL')
    console.log('✅ GGAL Data:', JSON.stringify(ggal.data, null, 2))
    console.log()
    
    console.log('🎉 All tests passed!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Status:', error.response.status)
    }
  }
}

testEndpoints()

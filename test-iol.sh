#!/bin/bash

# Script de prueba para verificar integración IOL

echo "🧪 Testing IOL Backend Integration"
echo "===================================="
echo ""

# Health check
echo "1️⃣ Health Check:"
curl -s http://localhost:4000/api/health | jq .
echo ""
echo ""

# Test GGAL (Acción)
echo "2️⃣ Cotización GGAL (Acción):"
curl -s http://localhost:4000/api/iol/quote/acciones/GGAL | jq .
echo ""
echo ""

# Test AL30 (Bono)
echo "3️⃣ Cotización AL30 (Bono):"
curl -s http://localhost:4000/api/iol/quote/bonos/AL30 | jq .
echo ""
echo ""

echo "✅ Tests completados"

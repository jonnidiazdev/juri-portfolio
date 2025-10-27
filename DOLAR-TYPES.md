# 💵 Cotizaciones del Dólar en Argentina

## Tipos de Dólar Disponibles

La aplicación muestra **7 tipos diferentes de cotizaciones del dólar** en Argentina, actualizadas en tiempo real desde DolarAPI.

### 1. 💵 Dólar Blue (Informal)

**¿Qué es?**
- Cotización del mercado informal/paralelo
- Compra-venta en efectivo sin control oficial
- Principal referencia para ahorro en dólares

**¿Cuándo usarlo?**
- Conversión de activos en USD a ARS
- Referencia para el "dólar real" en Argentina
- Usado por defecto en la app para conversiones

**Características:**
- Mayor precio que el oficial
- Fluctúa según oferta/demanda
- Sin límites de compra

---

### 2. 🏦 Dólar Oficial (Banco Nación)

**¿Qué es?**
- Cotización del Banco Central (BCRA)
- Regulado por el gobierno
- Para operaciones autorizadas

**¿Cuándo usarlo?**
- Importaciones autorizadas
- Pagos de deuda externa
- Viajes autorizados (cupo mensual limitado)

**Características:**
- Menor precio que el blue
- Acceso restringido (cupo $200 USD/mes)
- Requiere cuenta bancaria

---

### 3. 📈 Dólar MEP (Bolsa)

**¿Qué es?**
- Mercado Electrónico de Pagos
- Legal, se opera en Bolsa
- Compra/venta de bonos en pesos y dólares

**¿Cuándo usarlo?**
- Dolarización legal de ahorros
- Alternativa legal al blue
- Para quienes tienen cuenta comitente

**Características:**
- Legal y trazable
- Precio entre oficial y blue
- Requiere broker (ej: IOL)
- Parking de 1-3 días hábiles

---

### 4. 💱 Dólar CCL (Contado con Liquidación)

**¿Qué es?**
- Similar al MEP pero permite transferir al exterior
- Para girar dólares fuera de Argentina
- Opera con bonos AL30 o GD30

**¿Cuándo usarlo?**
- Transferir USD a cuenta en el exterior
- Inversiones internacionales
- Emigración/estudios afuera

**Características:**
- Precio más alto que MEP
- Legal para sacar dólares del país
- Requiere cuenta en el exterior

---

### 5. 🏢 Dólar Mayorista (Interbancario)

**¿Qué es?**
- Cotización para grandes empresas
- Operaciones entre bancos e importadores
- No accesible para individuos

**¿Cuándo usarlo?**
- Solo referencia (no operable)
- Para entender el "costo real" del dólar

**Características:**
- Similar al oficial
- Solo grandes volúmenes
- Precio mayorista (más bajo)

---

### 6. ₿ Dólar Cripto

**¿Qué es?**
- Cotización en exchanges de criptomonedas
- Precio implícito al comprar/vender USDT, DAI, etc.
- Mercado 24/7

**¿Cuándo usarlo?**
- Para usuarios de crypto
- Alternativa digital al blue
- Transferencias internacionales rápidas

**Características:**
- Precio cercano al blue
- Acceso instantáneo
- Sin límites ni restricciones
- Opera 24/7

---

### 7. 💳 Dólar Tarjeta (Turista)

**¿Qué es?**
- Dólar oficial + impuestos (30% PAIS + 30-35% Ganancias)
- Para compras en el exterior con tarjeta
- Servicios digitales (Netflix, Spotify, etc.)

**¿Cuándo usarlo?**
- Compras internacionales online
- Viajes al exterior
- Suscripciones extranjeras

**Características:**
- Precio más alto de todos
- ~75-80% más caro que oficial
- Automático en compras con tarjeta

---

## Comparación Rápida

| Tipo | Precio (aprox) | Legal | Acceso | Uso Principal |
|------|---------------|-------|--------|---------------|
| **Oficial** | Base | ✅ Sí | 🔒 Limitado | Operaciones autorizadas |
| **Blue** | +50-80% | ⚠️ Informal | ✅ Libre | Ahorro/cambio efectivo |
| **MEP** | +30-50% | ✅ Sí | 💼 Broker | Dolarización legal |
| **CCL** | +35-55% | ✅ Sí | 💼 Broker | Transferir al exterior |
| **Mayorista** | ~Oficial | ✅ Sí | 🏢 Empresas | Importaciones grandes |
| **Cripto** | ~Blue | ✅ Sí | 💻 Exchange | Crypto/digital |
| **Tarjeta** | +75-80% | ✅ Sí | 💳 Automático | Compras extranjeras |

## En la Aplicación

### Visualización

**Cotizaciones Principales** (siempre visibles):
- 💵 **Blue**: Referencia principal
- 🏦 **Oficial**: Referencia bancaria

**Otras Cotizaciones** (expandible):
- 📈 MEP (Bolsa)
- 💱 CCL (Contado con Liquidación)
- 🏢 Mayorista
- ₿ Cripto
- 💳 Tarjeta

### Datos Mostrados

Para cada tipo de dólar:
- **Compra**: Precio al que te compran USD
- **Venta**: Precio al que te venden USD
- **Spread**: Diferencia entre compra y venta
- **Última actualización**: Fecha/hora de la cotización

### Actualización

- ⏱️ **Frecuencia**: Cada 60 segundos
- 🔄 **Automática**: Usando React Query
- 📡 **Fuente**: [DolarAPI](https://dolarapi.com)

## Conversiones en la App

### Activos en USD → ARS

La aplicación usa **dólar blue** para convertir:
- Criptomonedas (BTC, ETH, etc.)
- Bonos en USD (GD30, AL30)
- Otros activos denominados en USD

**¿Por qué Blue?**
- Es la cotización más accesible
- Refleja el "valor real" del dólar
- Es la referencia del mercado informal

### Selector de Dólar (Futuro)

Próximamente podrás elegir qué tipo de dólar usar para conversiones:
- Blue (default)
- MEP
- CCL
- Cripto

## Tips y Recomendaciones

### Para Inversores

**Dolarizar legalmente:**
- Usa MEP si quieres mantener en Argentina
- Usa CCL si quieres transferir afuera

**Comprar cripto:**
- El dólar cripto es competitivo vs blue
- Acceso 24/7 sin restricciones

**Bonos en USD:**
- GD30, AL30 usan precio MEP/CCL
- Importante para calcular rentabilidad real

### Para Ahorristas

**Cupo oficial agotado:**
- Alternativa 1: Dólar MEP (legal, broker)
- Alternativa 2: Dólar Cripto (USDT, DAI)
- Alternativa 3: Dólar Blue (efectivo)

**Compras en el exterior:**
- Considerar dólar tarjeta (~80% más caro)
- Evaluar pagar con crypto si es posible

### Para la App

**Configurar conversión:**
- Por defecto: Blue
- Para bonos: Considerar MEP/CCL
- Para crypto: Usar Cripto

**Interpretar totales:**
- Total en ARS usa blue
- Puede diferir de broker (usa MEP)
- Es una estimación de valor real

## API - DolarAPI

**Endpoint base:**
```
https://dolarapi.com/v1/dolares
```

**Endpoints individuales:**
- `/v1/dolares/blue`
- `/v1/dolares/oficial`
- `/v1/dolares/bolsa`
- `/v1/dolares/contadoconliqui`
- `/v1/dolares/mayorista`
- `/v1/dolares/cripto`
- `/v1/dolares/tarjeta`

**Respuesta ejemplo:**
```json
{
  "compra": 1150.00,
  "venta": 1170.00,
  "casa": "blue",
  "nombre": "Blue",
  "moneda": "USD",
  "fechaActualizacion": "2025-10-27T15:30:00.000Z"
}
```

**Rate Limits:**
- Sin autenticación: Ilimitado
- Actualizaciones: Cada ~5 minutos
- Gratis y sin registro

## Recursos

- 📚 [Documentación DolarAPI](https://dolarapi.com/docs)
- 📊 [Ambito.com - Dólar Hoy](https://www.ambito.com/contenidos/dolar.html)
- 💹 [Cronista - Cotizaciones](https://www.cronista.com/finanzas-mercados/monedas/)
- 🏦 [BCRA - Cotizaciones Oficiales](https://www.bcra.gob.ar)

## Glosario

- **BCRA**: Banco Central de la República Argentina
- **MEP**: Mercado Electrónico de Pagos
- **CCL**: Contado con Liquidación
- **PAIS**: Impuesto Para una Argentina Inclusiva y Solidaria
- **Parking**: Tiempo de espera entre compra y venta de bonos
- **Spread**: Diferencia entre precio de compra y venta
- **AL30/GD30**: Bonos soberanos usados para operar dólar MEP/CCL

---

**Actualizado**: 27 de Octubre, 2025

# 💱 Soporte Multi-Moneda (ARS/USD)

## Características

La aplicación ahora soporta activos tanto en **Pesos Argentinos (ARS)** como en **Dólares (USD)**.

### Activos Soportados

#### Criptomonedas
- Siempre en **USD**
- Convertidas automáticamente a ARS usando dólar blue

#### Activos Argentinos

Puedes elegir la moneda al agregar cada activo:

- **Acciones**: Generalmente en ARS
- **CEDEARs**: Cotizan en ARS pero representan acciones en USD
- **Bonos**: 
  - ARS: TX28, TC24, etc.
  - USD: GD30, AL30, etc.
- **Letras**: Generalmente en ARS

## Cómo Usar

### Agregar Activo con Moneda Específica

1. Click en **"Agregar Activo"**
2. Selecciona el tipo de activo
3. **Selecciona la moneda**: ARS o USD
4. Ingresa ticker, cantidad y precio de compra en la moneda seleccionada

**Ejemplo - Bono en USD (GD30)**:
```
Tipo: Bono
Moneda: USD
Ticker: GD30
Cantidad: 100
Precio Compra: 45.50 (USD)
```

**Ejemplo - Acción en ARS (GGAL)**:
```
Tipo: Acción Argentina
Moneda: ARS
Ticker: GGAL
Cantidad: 50
Precio Compra: 1500 (ARS)
```

### Editar Moneda de Activo Existente

1. Hover sobre la tarjeta del activo
2. Click en el ícono de **editar**
3. Cambia la moneda si es necesario
4. Actualiza precio de compra si cambias la moneda

## Visualización

### Badge de Moneda

Cada activo muestra un badge indicando su moneda:
- 🟢 **USD** - Verde
- 🟡 **ARS** - Amarillo

### Valor Total

Para activos en USD, se muestra:
- Valor principal en USD
- Equivalente en ARS (usando dólar blue)

**Ejemplo**:
```
Valor Total
$1,234.56 USD
≈ $1,234,560.00 ARS
```

Para activos en ARS, se muestra:
- Valor principal en ARS
- Equivalente en USD MEP

**Ejemplo**:
```
Valor Total
$1,234,560.00 ARS
≈ $1,100.45 USD MEP
```

## Cálculo de Totales

El **resumen total** del portfolio convierte todo a ARS para unificar:

### Conversión Aplicada

1. **Activos en USD** → convertidos con dólar blue
2. **Activos en ARS** → ya en moneda base
3. **Total Portfolio** → suma en ARS

### Fórmula

```javascript
Total ARS = Σ (Activos USD × Dólar Blue) + Σ (Activos ARS)
```

## Casos de Uso

### Portfolio Mixto

**Ejemplo típico**:
- Bitcoin (cripto): USD → convertido a ARS
- GD30 (bono): USD → convertido a ARS
- GGAL (acción): ARS → directo
- AL30 (bono): USD → convertido a ARS

**Resumen total**: Suma todo en ARS usando dólar blue actual

### Cambio de Moneda

Si necesitas cambiar un activo de ARS a USD (o viceversa):

1. Editar el activo
2. Cambiar moneda
3. **Importante**: Actualizar el precio de compra a la nueva moneda
   - Si tenías $1500 ARS y cambias a USD, divide por dólar histórico

## Consideraciones

### Tipo de Cambio

- Se usa **dólar blue** para conversiones ARS→USD y USD→ARS en totales
- Se usa **dólar MEP** para mostrar equivalentes de activos ARS en USD
- Actualizado cada 60 segundos desde DolarAPI
- Visible en la sección "Cotizaciones del Dólar"

**Conversiones aplicadas**:
- Activos USD → ARS: usa dólar blue (venta)
- Activos ARS → USD: usa dólar MEP (venta) para equivalente visual

### Cotizaciones IOL

- Los precios de IOL vienen en la moneda que cotiza el instrumento
- El backend no hace conversión, devuelve precio tal cual
- La aplicación usa el campo `currency` del activo para interpretarlo

### Persistencia

La moneda se guarda en `localStorage` junto con:
- Tipo de activo
- Símbolo
- Cantidad
- Precio de compra

## Tips

### Bonos Argentinos

| Ticker | Moneda | Ejemplo |
|--------|--------|---------|
| GD30 | USD | Bono Global 2030 en dólares |
| AL30 | USD | Bono Argentina 2030 en dólares |
| TX28 | ARS | Bono en pesos ajustado por CER |
| TC24 | ARS | Bono en pesos |

### CEDEARs

Los CEDEARs **cotizan en pesos** (ARS) en el mercado argentino, pero puedes:
- Guardarlos en ARS (precio local)
- Guardarlos en USD (calculando ratio de conversión)

**Recomendación**: Usa ARS para CEDEARs ya que es el precio que ves en el broker.

### Acciones Locales

Siempre en **ARS**.

### Letras del Tesoro

Generalmente en **ARS**, pero algunas pueden estar en USD (LECER, etc).

## Formato de Moneda

La aplicación usa formato argentino:
- **ARS**: $1.234,56
- **USD**: $1,234.56 USD

## Futuras Mejoras

- [ ] Soporte para EUR y otras monedas
- [ ] Histórico de tipo de cambio
- [ ] Mostrar ganancia/pérdida considerando variación del dólar
- [ ] Alertas de cambio de tipo de cambio
- [ ] Gráfico de distribución por moneda

## Migración de Activos Existentes

Los activos creados antes de esta actualización:
- **Criptomonedas**: Automáticamente USD
- **Activos argentinos**: Automáticamente ARS

Si necesitas corregir la moneda, simplemente edita el activo.

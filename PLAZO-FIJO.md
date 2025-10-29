# 🏦 Plazos Fijos - El Juri-Portfolio

## Características

El portfolio ahora soporta **plazos fijos** con cálculo automático de rendimientos basado en:

- ✅ **TNA (Tasa Nominal Anual)** configurable
- ✅ **Fechas de inicio y vencimiento** personalizables
- ✅ **Cálculo diario** de intereses devengados
- ✅ **Progreso visual** del plazo transcurrido
- ✅ **Soporte multi-moneda** (ARS/USD)
- ✅ **Integración completa** con totales del portfolio

## Cómo Agregar un Plazo Fijo

### 1. Información Básica

```
Tipo de Activo: Plazo Fijo
Identificador: PF-001 (personalizable)
Nombre: Plazo Fijo Banco Nación
Banco: Banco Nación
```

### 2. Configuración Financiera

```
Moneda: ARS o USD
Capital Inicial: $100,000
TNA: 85.5% (para ARS) / 5.0% (para USD)
```

### 3. Fechas

```
Fecha de Inicio: 2024-01-15
Fecha de Vencimiento: 2024-04-15
```

## Cálculos Automáticos

### Fórmulas Utilizadas

#### Valor Actual
```javascript
Valor Actual = Capital × (1 + TNA/100 × días_transcurridos/365)
```

#### Interés Devengado
```javascript
Interés Devengado = Valor Actual - Capital Inicial
```

#### Progreso
```javascript
Progreso = (días_transcurridos / días_totales) × 100
```

### Estados del Plazo Fijo

| Estado | Descripción | Color |
|--------|-------------|-------|
| **Pendiente** | Aún no comenzó | 🟡 Amarillo |
| **Activo** | En curso | 🟢 Verde |
| **Vencido** | Plazo cumplido | 🔴 Rojo |

## Información Mostrada

### Panel Principal

- **Capital Inicial**: Monto invertido originalmente
- **Valor Actual**: Capital + intereses devengados hasta hoy
- **TNA**: Tasa nominal anual configurada
- **Duración**: Días totales del plazo fijo

### Progreso del Plazo

- **Barra de Progreso**: Visual del tiempo transcurrido
- **Días Transcurridos**: `X/Y días`
- **Días Restantes**: `Z días restantes`
- **Estado**: Pendiente/Activo/Vencido

### Rendimientos

- **Interés Devengado**: Ganancia acumulada hasta hoy
- **Interés Total**: Ganancia proyectada al vencimiento

### Fechas Importantes

- **Fecha de Inicio**: Cuándo comenzó a devengar intereses
- **Fecha de Vencimiento**: Cuándo se puede retirar

## Integración con Portfolio

### Totales Consolidados

Los plazos fijos se incluyen automáticamente en:

- ✅ **Totales en ARS**: Conversión automática USD→ARS
- ✅ **Totales en USD**: Conversión automática ARS→USD
- ✅ **Cálculos multi-moneda**: Usando cotización seleccionada

### Valorización

- **Capital**: Se considera como "invertido"
- **Valor Actual**: Se considera como "valor actual"
- **Ganancia**: Diferencia entre valor actual y capital

## Casos de Uso Típicos

### Plazo Fijo en Pesos

```
Banco: Banco Provincia
Capital: $500,000 ARS
TNA: 95.0%
Duración: 90 días
Rendimiento esperado: ~$116,438 ARS
```

### Plazo Fijo en Dólares

```
Banco: Banco Galicia
Capital: $10,000 USD
TNA: 6.5%
Duración: 180 días
Rendimiento esperado: ~$320 USD
```

### UVA (Unidad de Valor Adquisitivo)

```
Banco: Banco Nación
Capital: $200,000 ARS
TNA: 4.5% + UVA (simplificado como tasa fija)
Duración: 365 días
```

## Bancos Soportados

El sistema incluye los bancos más populares de Argentina:

- Banco Nación
- Banco Provincia
- Banco Ciudad
- Banco Macro
- Banco Galicia
- Banco Santander
- BBVA
- Banco Hipotecario
- Otros (personalizable)

## Validaciones Automáticas

### Campos Obligatorios

- ✅ Capital mayor a $0
- ✅ TNA mayor a 0%
- ✅ Fecha de inicio válida
- ✅ Fecha de vencimiento posterior al inicio

### Validaciones de Rango

- ⚠️ **TNA > 200%**: Advertencia de tasa excesiva
- ⚠️ **Duración < 1 día**: Error de plazo inválido
- ⚠️ **Duración > 10 años**: Error de plazo excesivo

## Tips y Recomendaciones

### Tasas Típicas (2024)

| Moneda | Banco | TNA Típica |
|--------|-------|------------|
| ARS | Banco Nación | 80-100% |
| ARS | Bancos Privados | 85-120% |
| USD | Banco Nación | 3-5% |
| USD | Bancos Privados | 4-8% |

### Mejores Prácticas

1. **Diversificación**: No concentrar todo en plazos fijos
2. **Escaleras**: Vencimientos escalonados para liquidez
3. **Comparación**: Evaluar TNA vs. inflación esperada
4. **Moneda**: Considerar contexto macroeconómico

### Consideraciones Fiscales

- **Personas Físicas**: Ganancias exentas hasta cierto monto
- **Monotributo**: Puede afectar la categorización
- **Bienes Personales**: Declarar en caso de superarse mínimos

## Limitaciones Actuales

- **UVA**: Se calcula como tasa fija (no considera inflación real)
- **Comisiones**: No se incluyen comisiones bancarias
- **Impuestos**: No se calculan retenciones automáticamente
- **Renovación**: No hay funcionalidad de renovación automática

## Próximas Mejoras

- [ ] Soporte para UVA con inflación real
- [ ] Cálculo de impuestos y retenciones
- [ ] Renovación automática de plazos vencidos
- [ ] Alertas de vencimiento próximo
- [ ] Comparador de tasas entre bancos
- [ ] Histórico de rentabilidad

## Migración de Datos

Los plazos fijos existentes en otras aplicaciones pueden migrarse fácilmente:

1. **Identificar**: Capital, TNA, fechas
2. **Convertir**: Ajustar formato de fechas
3. **Agregar**: Usar el formulario de la aplicación
4. **Verificar**: Comprobar cálculos vs. extractos bancarios

---

**💡 Tip**: Los plazos fijos son ideales para la porción conservadora del portfolio, especialmente durante períodos de alta volatilidad en otros activos.
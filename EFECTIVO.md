# Gestión de Efectivo y Cuentas Bancarias

## Descripción

El sistema de portfolio ahora incluye soporte completo para gestionar dinero no invertido, incluyendo efectivo en mano y cuentas bancarias en pesos argentinos y dólares.

## Tipos de Tenencia Soportados

### 1. Efectivo (Billetes)
- **Descripción**: Dinero en efectivo que tienes físicamente
- **Características**: 
  - Liquidez inmediata
  - Sin riesgo de mercado
  - No genera rentabilidad
  - No requiere banco

### 2. Cuentas Bancarias
- **Cuenta Bancaria**: Cuenta general sin especificar tipo
- **Caja de Ahorro**: Cuenta de ahorro tradicional
- **Cuenta Corriente**: Cuenta corriente con facilidades
- **Cuenta en Dólares**: Cuenta específica para moneda extranjera
- **Plazo Fijo Tradicional**: Plazo fijo básico (diferente del sistema avanzado)

## Configuración y Campos

### Campos Obligatorios
- **Identificador**: Código único para el activo (ej: EFECTIVO-001)
- **Nombre**: Descripción del activo
- **Tipo de Tenencia**: Selección del tipo de cuenta o efectivo
- **Moneda**: ARS (Pesos Argentinos) o USD (Dólares)
- **Monto Disponible**: Cantidad de dinero disponible

### Campos Opcionales
- **Banco/Entidad**: Institución bancaria (recomendado para cuentas)
- **Descripción**: Información adicional sobre el propósito del dinero

## Bancos Soportados

El sistema incluye una lista predefinida de bancos argentinos populares:

- Banco Nación
- Banco Provincia de Buenos Aires
- Banco Ciudad de Buenos Aires
- Banco Macro
- Banco Galicia
- Banco Santander Río
- BBVA Argentina
- Banco Hipotecario
- Banco Supervielle
- Banco Patagonia
- Banco Credicoop
- Banco Industrial
- Efectivo (Sin banco)
- Otro

## Funcionalidades del Sistema

### 1. Cálculos Automáticos
- **Valor Actual**: Para efectivo es igual al monto (no hay variación)
- **Capital Invertido**: El monto completo se considera capital disponible
- **Rentabilidad**: 0% (el efectivo no genera rentabilidad por sí mismo)
- **Riesgo**: Nulo (no hay riesgo de mercado)

### 2. Conversión Multi-Moneda
- **ARS a USD**: Usando cotización del dólar seleccionada
- **USD a ARS**: Conversión automática en totales
- **Integración**: Se incluye en los totales generales del portfolio

### 3. Visualización
- **Tarjetas Dedicadas**: Componente EfectivoCard especializado
- **Indicadores Visuales**: 
  - Íconos específicos por tipo de tenencia
  - Colores diferenciados
  - Información de liquidez y riesgo
- **Agrupación**: Sección separada "Efectivo y Cuentas Bancarias"

## Validaciones

### Validaciones Automáticas
- Monto debe ser mayor a 0
- Tipo de tenencia debe ser válido
- Moneda debe ser ARS o USD
- Advertencia si no se especifica banco para cuentas bancarias

### Recomendaciones
- Especificar banco para todas las cuentas bancarias
- Usar descripciones claras para identificar el propósito
- Mantener identificadores únicos y descriptivos

## Estadísticas Disponibles

### Métricas Generales
- **Total en ARS**: Suma de todo el efectivo en pesos
- **Total en USD**: Suma de todo el efectivo en dólares
- **Total de Cuentas**: Número de cuentas bancarias
- **Efectivo en Mano**: Monto total en billetes

### Distribuciones
- **Por Tipo**: Distribución del dinero por tipo de tenencia
- **Por Banco**: Distribución del dinero por entidad bancaria

## Casos de Uso Comunes

### 1. Efectivo para Gastos Diarios
```
Tipo: Efectivo (Billetes)
Moneda: ARS
Monto: $50,000
Banco: Sin banco
Descripción: "Efectivo para gastos del mes"
```

### 2. Cuenta de Ahorro en Pesos
```
Tipo: Caja de Ahorro
Moneda: ARS
Monto: $500,000
Banco: Banco Nación
Descripción: "Cuenta principal de ahorro"
```

### 3. Cuenta en Dólares
```
Tipo: Cuenta en Dólares
Moneda: USD
Monto: $5,000
Banco: Banco Galicia
Descripción: "Ahorros en dólares"
```

### 4. Fondo de Emergencia
```
Tipo: Cuenta Bancaria
Moneda: ARS
Monto: $200,000
Banco: Banco Macro
Descripción: "Fondo de emergencia familiar"
```

## Diferencias con Plazos Fijos

### Efectivo vs Plazo Fijo
- **Efectivo**: Disponible inmediatamente, sin rentabilidad
- **Plazo Fijo**: Bloqueado por período, genera rentabilidad con TNA

### Cuándo Usar Cada Uno
- **Efectivo**: Dinero de uso diario o emergencias
- **Plazo Fijo**: Inversión a término con rentabilidad esperada

## Integración con Portfolio

### Totales Generales
- Se incluye en el capital total del portfolio
- Se convierte automáticamente entre monedas
- No afecta el cálculo de rentabilidad general (ya que no varía)

### Filtros y Agrupación
- Aparece en sección separada "Efectivo y Cuentas Bancarias"
- Se excluye de cálculos de performance de inversiones
- Se incluye en totales de patrimonio

## Limitaciones Actuales

1. **Sin Rentabilidad**: No calcula intereses de cuentas de ahorro
2. **Sin Gastos**: No deduce comisiones bancarias
3. **Sin Histórico**: No mantiene histórico de movimientos
4. **Sin Sincronización**: No se conecta con APIs bancarias

## Roadmap Futuro

### Funcionalidades Planeadas
- Integración con APIs bancarias para balances automáticos
- Cálculo de intereses para cuentas de ahorro
- Tracking de gastos y comisiones
- Histórico de movimientos
- Alertas de saldos bajos
- Categorización de gastos

### Mejoras Pendientes
- Soporte para múltiples cuentas del mismo banco
- Integración con billeteras digitales
- Soporte para cuentas en otras monedas
- Dashboard específico para análisis de liquidez
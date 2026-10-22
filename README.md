# Laboratorio 06 Estado complejo contexto y custom hooks

Carrito de farmacia con React, TypeScript, Vite, useReducer, useContext y el hook useCart. Esta rama contiene el laboratorio 6; el laboratorio 5 corregido se conserva en `fix/administrador-tareas` (PR #1).

## Abrir esta versión

Si ya tienes el repositorio en tu computadora, ejecuta desde su carpeta:

```powershell
git fetch origin
git switch --track origin/laboratorio-06
npm install
npm run dev
```

Si la rama local ya existe, utiliza `git switch laboratorio-06` y `git pull --ff-only`.

Si todavía no tienes una copia local:

```powershell
git clone --branch laboratorio-06 https://github.com/alexandergdlc/farmacia-react.git farmacia-lab06
cd farmacia-lab06
npm install
npm run dev
```

Abre la dirección que indique Vite. No es necesario crear otro repositorio ni volver a ejecutar create-vite.

## Organización

- `src/cart.ts`: tipos, catálogo inicial y reducer puro.
- `src/useCart.ts`: contexto tipado y hook consumidor.
- `src/CartProvider.tsx`: estado global, almacenamiento y conectividad.
- `src/App.tsx`: catálogo y carrito.
- `src/index.css`: estilos.

Los archivos TaskManager.tsx y BuscadorUsuarios.tsx son antecedentes del laboratorio 5 y no se utilizan en la pantalla del laboratorio 6.

## Funciones

Agregar, disminuir, eliminar y vaciar; límite de stock; subtotal y total; cupón exacto ESTUDIANTE10 con 10 % no acumulable; persistencia del catálogo, carrito y cupón; indicador de conectividad; bloqueo de edición durante la simulación; actualización del stock solo al confirmar.

La clave local es `farmacia_lab06_v1`. No contiene datos reales de pacientes ni ventas reales. La función syncCartWithBackend simula una operación de dos segundos y actualiza únicamente el inventario local; no llama a un backend.

## Secuencia de capturas para el informe

1. Catálogo inicial: stocks 5, 2 y 0 y carrito vacío.
2. Agregar 2 Paracetamol y 1 Alcohol. Aplicar ESTUDIANTE10: subtotal S/ 11.50, descuento S/ 1.15 y total S/ 10.35.
3. Aplicar OTRO: código inválido, descuento cero y total S/ 11.50.
4. Vaciar y agregar 5 Paracetamol: límite de stock y aumento deshabilitado. Gasa sin stock. Después vaciar.
5. Agregar otra vez 2 Paracetamol y 1 Alcohol, aplicar ESTUDIANTE10 y recargar con conexión. Revisar la clave en F12 > Application > Local Storage.
6. Con la página cargada, F12 > Network > Offline. Mostrar modo sin conexión y sincronización deshabilitada. No recargar. Dejar las cantidades en 2 Paracetamol y 1 Alcohol.
7. Volver a No throttling y pulsar Sincronizar compra. Capturar Sincronizando durante los dos segundos.
8. Mostrar carrito vacío y stocks finales 3, 1 y 0.

localStorage conserva los datos, pero no los archivos de la página. Abrir la aplicación desde cero sin red requeriría caché de recursos y un service worker. navigator.onLine es orientativo y no prueba la disponibilidad de un servidor concreto.

Para reiniciar las pruebas, elimina únicamente `farmacia_lab06_v1` desde Application > Local Storage y recarga con conexión. Mantén el mismo origen y puerto para conservar el almacenamiento.

## Verificación

```powershell
npm run build
npm run lint
```

La implementación fue validada con ambos comandos y con pruebas de lógica del reducer para stock, cantidades, inmutabilidad, cupones y sincronización. Las capturas se realizan en el navegador local.

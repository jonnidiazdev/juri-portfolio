import { useState, useEffect } from 'react';

// Esta función auxiliar obtiene el valor inicial
function getSavedValue(key, initialValue) {
  // 1. Intenta leer de localStorage
  const savedValue = localStorage.getItem(key);

  // 2. Si hay algo guardado, lo parsea (de string a objeto) y lo devuelve
  if (savedValue) {
    try {
      return JSON.parse(savedValue);
    } catch (error) {
      // Si hay un error en el JSON (ej. está corrupto), usa el valor inicial
      console.error("Error al parsear localStorage", error);
      return initialValue;
    }
  }

  // 3. Si no hay nada guardado, devuelve el valor inicial
  return initialValue;
}

// Este es el Hook
export function useLocalStorageState(key, initialValue) {
  // 1. Usamos useState, pero le pasamos una *función* para que
  //    solo lea de localStorage LA PRIMERA VEZ (es más eficiente).
  const [value, setValue] = useState(() => {
    return getSavedValue(key, initialValue);
  });

  // 2. Usamos useEffect para guardar en localStorage CADA VEZ que
  //    el 'value' (o la 'key') cambien.
  useEffect(() => {
    // Solo guardamos si el valor no es 'undefined'
    if (value !== undefined) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]); // <-- La "dependencia": se ejecuta si 'key' o 'value' cambian

  // 3. Devolvemos el valor y la función para cambiarlo,
  //    igual que 'useState'.
  return [value, setValue];
}
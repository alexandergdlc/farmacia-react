import { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  name: string;
  email: string;
}

// Valida los datos recibidos desde la API.
function esUsuario(valor: unknown): valor is Usuario {
  if (!valor || typeof valor !== 'object') {
    return false;
  }

  const u = valor as Record<string, unknown>;

  return (
    typeof u.id === 'number' &&
    typeof u.name === 'string' &&
    typeof u.email === 'string'
  );
}

export default function BuscadorUsuarios() {
  const [usuarios, setUsuarios] =
    useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const control = new AbortController();

    async function cargar() {
      setCargando(true);
      setError(null);

      try {
        const respuesta = await fetch(
          'https://jsonplaceholder.typicode.com/users',
          { signal: control.signal },
        );

        if (!respuesta.ok) {
          throw new Error('HTTP ' + respuesta.status);
        }

        const datos: unknown = await respuesta.json();

        if (
          !Array.isArray(datos) ||
          !datos.every(esUsuario)
        ) {
          throw new Error('Respuesta no válida');
        }

        if (!control.signal.aborted) {
          setUsuarios(datos);
        }
      } catch {
        if (!control.signal.aborted) {
          setError(
            'No se pudieron cargar los usuarios. Reintenta.',
          );
        }
      } finally {
        if (!control.signal.aborted) {
          setCargando(false);
        }
      }
    }

    void cargar();

    return () => control.abort();
  }, [intento]);

  const visibles = usuarios.filter(u =>
    u.name
      .toLowerCase()
      .includes(busqueda.toLowerCase()) ||
    u.email
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <section>
      <h2>Buscador de usuarios</h2>

      <label>
        Nombre o correo
        <input
          value={busqueda}
          placeholder="Buscar por nombre o correo"
          disabled={cargando || error !== null}
          onChange={e => setBusqueda(e.target.value)}
        />
      </label>

      {cargando && <p>Cargando usuarios...</p>}

      {!cargando && error && (
        <div role="alert">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setIntento(n => n + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && (
        visibles.length === 0 ? (
          <p>No se encontraron resultados.</p>
        ) : (
          <ul>
            {visibles.map(u => (
              <li key={u.id}>
                <strong>{u.name}</strong>
                <span>{u.email}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}
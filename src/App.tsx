import TaskManager from './TaskManager';
import BuscadorUsuarios from './BuscadorUsuarios';

export default function App() {
  return (
    <main>
      <h1>Laboratorio 05 React y TypeScript</h1>

      <p>
        Administrador de tareas de farmacia y buscador de usuarios.
      </p>

      <TaskManager />
      <BuscadorUsuarios />
    </main>
  );
}
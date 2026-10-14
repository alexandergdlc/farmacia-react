import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
type Priority = 'low' | 'medium' | 'high';
type Categoria = 'Trabajo' | 'Personal' | 'Estudio';
type Estado = 'Todas' | 'Pendientes' | 'Completadas';
interface Task {
  id: string;
  titulo: string;
  categoria: Categoria;
  completada: boolean;
  priority: Priority;
}
interface TaskItemProps {
  tarea: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
function TaskItem({ tarea, onToggle, onDelete }: TaskItemProps) {
  return <li>
    <label className="tarea-texto">
      <input type="checkbox" checked={tarea.completada}
        onChange={() => onToggle(tarea.id)} />
      <span style={{ textDecoration:
        tarea.completada ? 'line-through' : 'none' }}>
        {tarea.titulo}
      </span>
    </label>
    {' — '}{tarea.categoria}{' — '}{tarea.priority}{' '}
    <button onClick={() => onDelete(tarea.id)}>Eliminar</button>
  </li>;
}
const CLAVE = 'farmacia_tareas_lab05';
function esTask(valor: unknown): valor is Task {
  if (!valor || typeof valor !== 'object') return false;
  const t = valor as Record<string, unknown>;
  return typeof t.id === 'string' && typeof t.titulo === 'string'
    && typeof t.completada === 'boolean'
    && ['Trabajo', 'Personal', 'Estudio'].includes(String(t.categoria))
    && ['low', 'medium', 'high'].includes(String(t.priority));
}
function leerTareas(): Task[] {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(datos) && datos.every(esTask) ? datos : [];
  } catch { return []; }
}

export default function TaskManager() {
  const [tareas, setTareas] = useState<Task[]>(leerTareas);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Trabajo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [estado, setEstado] = useState<Estado>('Todas');
  const [catFiltro, setCatFiltro] = useState<Categoria | 'Todas'>('Todas');
  const [prioFiltro, setPrioFiltro] = useState<Priority | 'Todas'>('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [aviso, setAviso] = useState('');
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(tareas));
    } catch {
      // El fallo de la API del navegador debe notificarse en la interfaz.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAviso('No se pudieron guardar las tareas.');
    }
  }, [tareas]);
  function agregar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setAviso('');
    const nueva: Task = {
      id: crypto.randomUUID(), titulo: titulo.trim(), categoria,
      priority, completada: false
    };
    setTareas(anteriores => [...anteriores, nueva]);
    setTitulo('');
  }
  function completar(id: string) {
    setAviso('');
    setTareas(anteriores => anteriores.map(t =>
      t.id === id ? { ...t, completada: !t.completada } : t));
  }
  function eliminar(id: string) {
    setAviso('');
    setTareas(anteriores => anteriores.filter(t => t.id !== id));
  }
  const visibles = tareas.filter(t =>
    (estado === 'Todas' || (estado === 'Completadas'
      ? t.completada : !t.completada)) &&
    (catFiltro === 'Todas' || t.categoria === catFiltro) &&
    (prioFiltro === 'Todas' || t.priority === prioFiltro) &&
    t.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );
  const completadas = tareas.filter(t => t.completada).length;

  return <section>
    <h2>Tareas de farmacia</h2>
    <form onSubmit={agregar} className="controles">
      <label>Tarea <input value={titulo} required
        onChange={e => setTitulo(e.target.value)} /></label>
      <label>Categoría <select value={categoria}
        onChange={e => setCategoria(e.target.value as Categoria)}>
        {['Trabajo', 'Personal', 'Estudio'].map(c =>
          <option key={c}>{c}</option>)}
      </select></label>
      <label>Prioridad <select value={priority}
        onChange={e => setPriority(e.target.value as Priority)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select></label>
      <button type="submit">Agregar</button>
    </form>
    <p>{completadas} de {tareas.length} tareas completadas</p>
    {aviso && <p role="alert">{aviso}</p>}
    <div className="controles">
    <label>Buscar tarea <input value={busqueda}
      onChange={e => setBusqueda(e.target.value)} /></label>
    <label>Estado <select value={estado}
      onChange={e => setEstado(e.target.value as Estado)}>
      {['Todas', 'Pendientes', 'Completadas'].map(x =>
        <option key={x}>{x}</option>)}
    </select></label>
    <label>Categoría <select value={catFiltro}
      onChange={e => setCatFiltro(e.target.value as Categoria | 'Todas')}>
      {['Todas', 'Trabajo', 'Personal', 'Estudio'].map(x =>
        <option key={x}>{x}</option>)}
    </select></label>
    <label>Prioridad <select value={prioFiltro}
      onChange={e => setPrioFiltro(e.target.value as Priority | 'Todas')}>
      <option value="Todas">Todas</option>
      <option value="low">Baja</option>
      <option value="medium">Media</option>
      <option value="high">Alta</option>
    </select></label>
    </div>
    {visibles.length === 0 ? <p>No hay tareas para estos filtros.</p> :
      <ul>{visibles.map(t => <TaskItem key={t.id} tarea={t}
        onToggle={completar} onDelete={eliminar} />)}</ul>}
  </section>;
}

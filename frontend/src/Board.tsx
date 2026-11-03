import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { COLUMNS, type Status, type Task } from './types'

type CardProps = { task: Task; onDelete: (id: number) => void }

function Card({ task, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <li ref={setNodeRef} style={style} className="card" {...listeners} {...attributes}>
      <span>{task.title}</span>
      <button
        className="del"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onDelete(task.id)}
        aria-label="Удалить задачу"
      >
        ×
      </button>
    </li>
  )
}

type ColumnProps = {
  status: Status
  title: string
  tasks: Task[]
  onDelete: (id: number) => void
}

function Column({ status, title, tasks, onDelete }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div ref={setNodeRef} className={`column${isOver ? ' over' : ''}`}>
      <h3>
        {title} ({tasks.length})
      </h3>
      <ul>
        {tasks.map((t) => (
          <Card key={t.id} task={t} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  )
}

type BoardProps = {
  tasks: Task[]
  onMove: (id: number, status: Status) => void
  onDelete: (id: number) => void
}

export default function Board({ tasks, onMove, onDelete }: BoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return
    const task = tasks.find((t) => t.id === active.id)
    const status = over.id as Status
    if (task && task.status !== status) onMove(task.id, status)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="board">
        {COLUMNS.map((c) => (
          <Column
            key={c.status}
            status={c.status}
            title={c.title}
            tasks={tasks.filter((t) => t.status === c.status)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  )
}
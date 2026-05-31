'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Stage } from '@/lib/stages'
import { addStage, updateStage, deleteStage, reorderStages } from '@/lib/actions'

function StageRow({
  stage,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  stage: Stage
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  isFirst: boolean
  isLast: boolean
}) {
  const [label, setLabel] = useState(stage.label)
  const [description, setDescription] = useState(stage.description ?? '')
  const [isFinal, setIsFinal] = useState(stage.is_final)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleSave() {
    startTransition(async () => {
      await updateStage(stage.id, label, description || null, isFinal)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    })
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 py-5"
    >
      <div className="flex flex-col gap-0.5 pt-1 shrink-0">
        <button
          onClick={() => onMoveUp(stage.id)}
          disabled={isFirst}
          className="text-stone/40 transition hover:text-ink disabled:opacity-20 leading-none text-xs"
        >
          ▲
        </button>
        <button
          onClick={() => onMoveDown(stage.id)}
          disabled={isLast}
          className="text-stone/40 transition hover:text-ink disabled:opacity-20 leading-none text-xs"
        >
          ▼
        </button>
      </div>

      <button
        {...attributes}
        {...listeners}
        className="text-stone/30 hover:text-stone cursor-grab active:cursor-grabbing pt-1 shrink-0 text-lg leading-none select-none"
        title="גרור לשינוי סדר"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="field w-full mb-2"
          placeholder="שם השלב"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="field w-full text-sm text-stone resize-none"
          placeholder="תיאור השלב (אופציונלי)"
        />
      </div>

      <div className="flex items-center gap-3 shrink-0 pt-1">
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-stone cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isFinal}
            onChange={(e) => setIsFinal(e.target.checked)}
            className="accent-gold"
          />
          סופי
        </label>

        <button
          onClick={handleSave}
          disabled={isPending}
          className="btn-ghost shrink-0 px-4 py-2 min-w-[60px]"
        >
          {saved ? '✓' : isPending ? '...' : 'שמור'}
        </button>

        <button
          onClick={() => {
            if (confirm('למחוק שלב זה?')) onDelete(stage.id)
          }}
          className="shrink-0 text-stone transition hover:text-gold-deep"
          aria-label="מחק שלב"
        >
          ✕
        </button>
      </div>
    </li>
  )
}

export default function StagesClient({ initialStages }: { initialStages: Stage[] }) {
  const [stages, setStages] = useState(initialStages)
  const [newLabel, setNewLabel] = useState('')
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setStages((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)
      startTransition(() => reorderStages(reordered.map((s) => s.id)))
      return reordered
    })
  }

  function handleMoveUp(id: string) {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === 0) return prev
      const reordered = arrayMove(prev, idx, idx - 1)
      startTransition(() => reorderStages(reordered.map((s) => s.id)))
      return reordered
    })
  }

  function handleMoveDown(id: string) {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id)
      if (idx === prev.length - 1) return prev
      const reordered = arrayMove(prev, idx, idx + 1)
      startTransition(() => reorderStages(reordered.map((s) => s.id)))
      return reordered
    })
  }

  function handleDelete(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id))
    startTransition(() => deleteStage(id))
  }

  function handleAdd() {
    if (!newLabel.trim()) return
    startTransition(async () => {
      await addStage(newLabel.trim(), null, false)
      setNewLabel('')
    })
  }

  return (
    <div>
      <ul className="mb-12 divide-y divide-hairline">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {stages.map((stage, index) => (
              <StageRow
                key={stage.id}
                stage={stage}
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={index === 0}
                isLast={index === stages.length - 1}
              />
            ))}
          </SortableContext>
        </DndContext>

        {stages.length === 0 && (
          <li className="py-10 text-center text-sm text-stone">אין שלבים עדיין</li>
        )}
      </ul>

      <section className="panel p-8">
        <h2 className="mb-6 text-xl font-normal text-ink">הוסף שלב</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="label">שם השלב</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="לדוגמה: עיצוב, יציקה, ליטוש"
              className="field"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newLabel.trim() || isPending}
            className="btn-primary shrink-0"
          >
            הוסף
          </button>
        </div>
      </section>
    </div>
  )
}

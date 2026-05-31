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
    <div
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 py-4"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        {/* Up/Down arrows */}
        <div className="flex flex-col gap-0.5 pt-1 flex-shrink-0">
          <button
            onClick={() => onMoveUp(stage.id)}
            disabled={isFirst}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs"
          >
            ▲
          </button>
          <button
            onClick={() => onMoveDown(stage.id)}
            disabled={isLast}
            className="text-gray-300 hover:text-gray-600 disabled:opacity-20 leading-none text-xs"
          >
            ▼
          </button>
        </div>

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-200 hover:text-gray-400 cursor-grab active:cursor-grabbing pt-1 flex-shrink-0 text-lg leading-none select-none"
          title="גרור לשינוי סדר"
        >
          ⠿
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none text-base text-right pb-0.5 mb-2"
            placeholder="שם השלב"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent border-b border-gray-200 focus:border-gray-400 outline-none text-sm text-right text-gray-500 resize-none pb-0.5"
            placeholder="תיאור השלב (אופציונלי)"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 pt-1">
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer select-none">
            <span>סופי</span>
            <input
              type="checkbox"
              checked={isFinal}
              onChange={(e) => setIsFinal(e.target.checked)}
              className="rounded-full w-4 h-4 accent-gray-600"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors min-w-[60px]"
          >
            {saved ? '✓' : isPending ? '...' : 'שמור'}
          </button>

          <button
            onClick={() => {
              if (confirm('למחוק שלב זה?')) onDelete(stage.id)
            }}
            className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
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
      await addStage(newLabel.trim(), null)
      setNewLabel('')
    })
  }

  return (
    <div dir="rtl">
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
        <p className="text-center text-gray-400 text-sm py-10">אין שלבים עדיין</p>
      )}

      {/* Add new stage */}
      <div className="mt-8 flex gap-2" dir="rtl">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="שם שלב חדש..."
          className="flex-1 bg-transparent border-b border-gray-300 focus:border-gray-600 outline-none text-sm pb-1 text-right"
        />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || isPending}
          className="px-4 py-1.5 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          + הוסף
        </button>
      </div>
    </div>
  )
}

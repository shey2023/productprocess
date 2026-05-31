'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Stage } from '@/lib/stages'
import { addStage, updateStage, deleteStage, reorderStages } from '@/lib/actions'

function SortableStage({
  stage,
  onSave,
  onDelete,
}: {
  stage: Stage
  onSave: (id: string, label: string, description: string | null, is_final: boolean) => void
  onDelete: (id: string) => void
}) {
  const [label, setLabel] = useState(stage.label)
  const [description, setDescription] = useState(stage.description ?? '')
  const [isFinal, setIsFinal] = useState(stage.is_final)
  const [editing, setEditing] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  function handleSave() {
    onSave(stage.id, label, description || null, isFinal)
    setEditing(false)
  }

  function handleCancel() {
    setLabel(stage.label)
    setDescription(stage.description ?? '')
    setIsFinal(stage.is_final)
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      dir="rtl"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none text-xl leading-none"
        aria-label="גרור לשינוי סדר"
      >
        ⠿
      </button>

      <div className="flex-1 space-y-2">
        {editing ? (
          <>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium"
              placeholder="שם השלב"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm resize-none"
              placeholder="תיאור השלב (אופציונלי)"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
                className="rounded"
              />
              שלב סיום
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                שמור
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
              >
                ביטול
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{stage.label}</p>
              {stage.is_final && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  סיום
                </span>
              )}
            </div>
            {stage.description && (
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{stage.description}</p>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="ערוך"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(stage.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="מחק"
          >
            🗑
          </button>
        </div>
      )}
    </div>
  )
}

export default function StagesClient({ initialStages }: { initialStages: Stage[] }) {
  const [stages, setStages] = useState(initialStages)
  const [newLabel, setNewLabel] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setStages((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)

      startTransition(() => {
        reorderStages(reordered.map((s) => s.id))
      })

      return reordered
    })
  }

  function handleSave(id: string, label: string, description: string | null, is_final: boolean) {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label, description, is_final } : s))
    )
    startTransition(() => {
      updateStage(id, label, description, is_final)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('למחוק את השלב?')) return
    setStages((prev) => prev.filter((s) => s.id !== id))
    startTransition(() => {
      deleteStage(id)
    })
  }

  function handleAdd() {
    if (!newLabel.trim()) return
    startTransition(async () => {
      await addStage(newLabel.trim(), newDescription.trim() || null)
      setNewLabel('')
      setNewDescription('')
    })
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">הוסף שלב חדש</h2>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="שם השלב"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="תיאור (אופציונלי)"
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          + הוסף שלב
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map((stage) => (
              <SortableStage
                key={stage.id}
                stage={stage}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {stages.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-12">אין שלבים עדיין</p>
      )}

      {isPending && (
        <p className="text-center text-xs text-gray-400">שומר...</p>
      )}
    </div>
  )
}

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
import { addStage, renameStage, deleteStage, reorderStages } from '@/lib/actions'

function SortableStage({
  stage,
  onSave,
  onDelete,
}: {
  stage: Stage
  onSave: (id: string, name: string, description: string | null) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(stage.name)
  const [description, setDescription] = useState(stage.description ?? '')
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
    onSave(stage.id, name, description || null)
    setEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 items-start bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 select-none"
        aria-label="גרור לשינוי סדר"
      >
        ⠿
      </button>

      <div className="flex-1 space-y-2">
        {editing ? (
          <>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-medium"
              placeholder="שם השלב"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none"
              placeholder="תיאור השלב (אופציונלי)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                שמור
              </button>
              <button
                onClick={() => {
                  setName(stage.name)
                  setDescription(stage.description ?? '')
                  setEditing(false)
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
              >
                ביטול
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-medium text-gray-900">{stage.name}</p>
            {stage.description && (
              <p className="text-sm text-gray-500 whitespace-pre-wrap">{stage.description}</p>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(stage.id)}
            className="px-2 py-1 text-sm text-red-500 hover:bg-red-50 rounded"
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
  const [newName, setNewName] = useState('')
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

  function handleSave(id: string, name: string, description: string | null) {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, description } : s))
    )
    startTransition(() => {
      renameStage(id, name, description)
    })
  }

  function handleDelete(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id))
    startTransition(() => {
      deleteStage(id)
    })
  }

  function handleAdd() {
    if (!newName.trim()) return
    startTransition(async () => {
      await addStage(newName.trim(), newDescription.trim() || null)
      setNewName('')
      setNewDescription('')
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-700">הוסף שלב חדש</h2>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="שם השלב"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="תיאור (אופציונלי)"
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          + הוסף
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
        <p className="text-center text-gray-400 text-sm py-8">אין שלבים עדיין</p>
      )}
    </div>
  )
}

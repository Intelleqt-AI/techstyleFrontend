'use client';
import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { GripVertical, CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import { useQueryClient } from '@tanstack/react-query';
import useDeleteData from '@/hooks/useDelete';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

const DragHandle = SortableHandle(() => (
  <span className=" cursor-grab active:cursor-grabbing">
    <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-700" aria-hidden="true" />
  </span>
));

// Small controlled input that keeps local state to avoid caret jumps while typing.
const SubtaskInput = React.forwardRef<
  HTMLInputElement,
  { value: string; onChange: (v: string) => void; className?: string; placeholder?: string }
>(({ value, onChange, className, placeholder }, forwardedRef) => {
  const innerRef = useRef<HTMLInputElement | null>(null);

  // stable callback ref that assigns both internal ref and forwarded ref
  const setRefs = useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (!forwardedRef) return;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else (forwardedRef as any).current = el;
    },
    [forwardedRef]
  );

  // Commit value to parent on blur or Enter key
  const commit = useCallback(() => {
    if (!innerRef.current) return;
    onChange(innerRef.current.value || '');
  }, [onChange]);

  return (
    <input
      ref={setRefs}
      type="text"
      defaultValue={value}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          commit();
          // keep focus so user can continue
          e.currentTarget.blur();
        }
      }}
      className={className}
      placeholder={placeholder}
    />
  );
});

const ItemComponent = ({ subtask, onCheck, onEdit, onDelete, inputRef }: any) => {
  return (
    <div className="subtask-row hover:shadow-sm group duration-300 flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 pl-2 pr-2 h-10">
      <Checkbox
        checked={subtask?.selected}
        onCheckedChange={() => onCheck(subtask.id)}
        className="mr-1 focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
        aria-label="Toggle subtask"
      />

      <SubtaskInput
        data-subtask-id={subtask.id}
        ref={inputRef}
        value={subtask.text || ''}
        onChange={val => onEdit(subtask.id, val)}
        className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent h-9 text-sm"
        placeholder="Subtask..."
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-gray-700"
        onClick={() => onDelete(subtask.id)}
        aria-label="Remove subtask"
        title="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DragHandle />
    </div>
  );
};

const MemoizedItem = React.memo(ItemComponent, (prev: any, next: any) => {
  // Only re-render if relevant subtask fields changed
  return prev.subtask.id === next.subtask.id && prev.subtask.text === next.subtask.text && prev.subtask.selected === next.subtask.selected;
});

const SortableItem = SortableElement(MemoizedItem as any);

const SortableList = SortableContainer(({ subtasks, onCheck, onEdit, onDelete, inputRefs, inputRefCallbacks }: any) => (
  <div className="space-y-2">
    {(subtasks || []).map((subtask: any, index: number) => (
      <SortableItem
        key={subtask.id}
        index={index}
        subtask={subtask}
        onCheck={onCheck}
        onEdit={onEdit}
        onDelete={onDelete}
        inputRef={
          inputRefCallbacks.current[subtask.id] ||
          (inputRefCallbacks.current[subtask.id] = (el: any) => {
            inputRefs.current[subtask.id] = el;
          })
        }
      />
    ))}
  </div>
));

const DraggableSubtasks2 = React.forwardRef(({ subtasks, setTaskValues, taskId }: any, ref: any) => {
  const sortedSubtasks = [...(subtasks || [])].sort((a, b) => a.order - b.order);

  const inputRefs = useRef({});
  // Keep stable ref-callbacks per-subtask so React doesn't call previous ref with null
  // on every render (which can blur the input and move the caret).
  const inputRefCallbacks = useRef({});

  const onSortEnd = async ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const newItems = arrayMove(sortedSubtasks, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx,
    }));

    setTaskValues(prev => ({
      ...prev,
      subtasks: newItems,
    }));
  };

  const handleCheck = useCallback(
    id => {
      setTaskValues((prev: any) => ({
        ...prev,
        subtasks: prev.subtasks.map((task: any) => (task.id === id ? { ...task, selected: !task.selected } : task)),
      }));
    },
    [setTaskValues]
  );

  const handleEdit = useCallback(
    (id, value) => {
      setTaskValues((prev: any) => ({
        ...prev,
        subtasks: prev.subtasks.map((task: any) => (task.id === id ? { ...task, text: value } : task)),
      }));
    },
    [setTaskValues]
  );

  const handleDelete = useCallback(
    id => {
      setTaskValues(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(task => task.id !== id),
      }));
    },
    [setTaskValues]
  );

  const handleAdd = () => {
    const newId = `subtask-${Date.now()}`;
    const maxOrder = Math.max(...(sortedSubtasks?.map(st => st.order) || [0]), 0);
    setTaskValues(prev => ({
      ...prev,
      subtasks: [
        ...(prev.subtasks || []),
        {
          id: newId,
          text: '',
          completed: false,
          order: maxOrder + 1,
          isOffline: true,
        },
      ],
    }));
    // Focus on the new input after a short delay to ensure DOM is updated
    setTimeout(() => {
      if (inputRefs.current[newId]) {
        inputRefs.current[newId].focus();
      }
    }, 100);
  };

  // Method to focus on the last input (called from parent component)
  const focusLastInput = useCallback(() => {
    setTimeout(() => {
      const lastSubtask = sortedSubtasks[sortedSubtasks.length - 1];
      if (lastSubtask && inputRefs.current[lastSubtask.id]) {
        inputRefs.current[lastSubtask.id].focus();
      }
    }, 100);
  }, [sortedSubtasks]);

  // Expose the focusLastInput method to parent component
  React.useImperativeHandle(ref, () => ({
    focusLastInput,
  }));

  return (
    <div className="">
      <SortableList
        subtasks={sortedSubtasks}
        onSortEnd={onSortEnd}
        useDragHandle
        lockAxis="y"
        helperClass="sortable-helper"
        onCheck={handleCheck}
        onEdit={handleEdit}
        onDelete={handleDelete}
        inputRefs={inputRefs}
        inputRefCallbacks={inputRefCallbacks}
      />

      <div
        onClick={handleAdd}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') handleAdd();
        }}
        className="flex justify-end mt-3"
      >
        <Button type="button" variant="ghost" size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add subtask
        </Button>
      </div>
    </div>
  );
});

export default DraggableSubtasks2;

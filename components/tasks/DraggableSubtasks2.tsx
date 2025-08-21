'use client';
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { GripVertical, CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { usePost } from '@/hooks/usePost';
import debounce from 'lodash/debounce';
import { useQueryClient } from '@tanstack/react-query';
import useDeleteData from '@/hooks/useDelete';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';

const DragHandle = SortableHandle(() => (
  <span className=" cursor-grab active:cursor-grabbing">
    <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-700" aria-hidden="true" />
  </span>
));

const SortableItem = SortableElement(({ subtask, onCheck, onEdit, onDelete, inputRef }) => (
  <div className="subtask-row hover:shadow-sm group duration-300 flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 pl-2 pr-2 h-10">
    <Checkbox
      checked={subtask?.selected}
      onCheckedChange={() => onCheck(subtask)}
      className="mr-1 focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
      aria-label="Toggle subtask"
    />

    <input
      ref={inputRef}
      type="text"
      value={subtask.text || ''}
      onChange={e => onEdit(subtask, e.target.value)}
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

    {/* <button
      onClick={() => onDelete(subtask.id)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',

        display: 'flex',
        alignItems: 'center',
      }}
      className="delete-btn mr-4 opacity-0 duration-200 group-hover:opacity-100"
      tabIndex={-1}
      aria-label="Delete subtask"
    >
      <Trash2 size={16} />
    </button> */}
    <DragHandle />
  </div>
));

const SortableList = SortableContainer(({ subtasks, onCheck, onEdit, onDelete, inputRefs }) => (
  <div className="space-y-2">
    {subtasks.map((subtask, index) => (
      <SortableItem
        key={subtask.id}
        index={index}
        subtask={subtask}
        onCheck={onCheck}
        onEdit={onEdit}
        onDelete={onDelete}
        inputRef={el => (inputRefs.current[subtask.id] = el)}
      />
    ))}
  </div>
));

const DraggableSubtasks2 = React.forwardRef(({ subtasks, setTaskValues, taskId }, ref) => {
  console.log(subtasks);
  const { mutate, error: modifyError, isPending } = usePost();
  const { mutate: deleteMutation, error: deleteError, isPending: deletePending } = useDeleteData();
  const sortedSubtasks = [...(subtasks || [])].sort((a, b) => a.order - b.order);
  const queryClient = useQueryClient();

  console.log('sortedSubtasks', sortedSubtasks);

  // for old subtask
  const debouncedMutate = useMemo(() => {
    return debounce((id, value) => {
      mutate(
        { url: `dashboard/subtasks/${id}/`, data: { name: value } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries([`dashboard/tasks/${taskId}/`]);
          },
        }
      );
    }, 500);
  }, [mutate]);

  // for new subtask
  const debouncedCreateSubTask = useMemo(() => {
    return debounce((value, oldID) => {
      mutate(
        { url: `dashboard/subtasks/`, data: value },
        {
          onSuccess: data => {
            queryClient.invalidateQueries(['dashboard/tasks/']);
            setTaskValues(prev => ({
              ...prev,
              sub_task: prev.sub_task.map(task => (task.id === oldID ? data?.data : task)),
            }));
            setTimeout(() => {
              if (data?.data?.id && inputRefs.current[data.data.id]) {
                inputRefs.current[data.data.id].focus();
              }
            }, 100);
          },
        }
      );
    }, 1000);
  }, [mutate]);

  useEffect(() => {
    return () => {
      debouncedMutate.cancel();
    };
  }, [debouncedMutate]);

  async function updateSubtaskOrder(id, order) {
    mutate(
      { url: `dashboard/subtasks/${id}/`, data: { order: order } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries([`dashboard/tasks/${taskId}/`]);
        },
      }
    );
  }

  const inputRefs = useRef({});

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

    // Find only the subtasks whose order changed by comparing IDs
    const changed = newItems.filter((newItem, newIdx) => {
      const originalItem = sortedSubtasks.find(item => item.id === newItem.id);
      return originalItem && originalItem.order !== newItem.order;
    });

    try {
      await Promise.all(changed.map(item => updateSubtaskOrder(item.id, item.order)));
    } catch (error) {
      console.error('Failed to update subtask order:', error);
    }
  };

  const handleCheck = useCallback(
    subtask => {
      setTaskValues(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(task => (task.id === subtask.id ? { ...task, selected: !task.selected } : task)),
      }));
      //   mutate(
      //     { url: `dashboard/subtasks/${subtask.id}/`, data: { completed: !subtask.completed } },
      //     {
      //       onSuccess: () => {
      //         queryClient.invalidateQueries(['dashboard/tasks/']);
      //       },
      //     }
      //   );
    },
    [setTaskValues]
  );

  const handleEdit = useCallback(
    (subtask, value) => {
      setTaskValues(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(task => (task.id === subtask.id ? { ...task, text: value } : task)),
      }));
      //   if (subtask.isOffline) {
      //     debouncedCreateSubTask({ name: value, task: taskId }, subtask.id);
      //     return;
      //   }
      //   debouncedMutate(subtask.id, value);
    },
    [setTaskValues]
  );

  const handleDelete = useCallback(
    id => {
      setTaskValues(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(task => task.id !== id),
      }));
      //   deleteMutation(
      //     { url: `dashboard/subtasks/${id}/` },
      //     {
      //       onSuccess: () => {
      //         queryClient.invalidateQueries(['dashboard/tasks/']);
      //       },
      //     }
      //   );
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

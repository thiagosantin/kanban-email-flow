
declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  export type DraggableId = string;
  export type DroppableId = string;
  export type DragStart = any;
  export type DropResult = any;
  export type DragUpdate = any;
  export type HookProvided = any;

  export interface DraggableRubric {
    draggableId: DraggableId;
    type: string;
    source: {
      droppableId: DroppableId;
      index: number;
    };
  }

  export type DraggableChildrenFn = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => React.ReactNode;

  export type DroppableProvided = any;
  export type DraggableProvided = any;
  export type DroppableStateSnapshot = any;
  export type DraggableStateSnapshot = any;

  export interface DroppableProps {
    droppableId: DroppableId;
    type?: string;
    ignoreContainerClipping?: boolean;
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'vertical' | 'horizontal';
    children: (
      provided: DroppableProvided,
      snapshot: DroppableStateSnapshot,
    ) => React.ReactNode;
  }

  export interface DraggableProps {
    draggableId: DraggableId;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: DraggableChildrenFn;
  }

  export interface DragDropContextProps {
    onBeforeCapture?: (before: any) => void;
    onBeforeDragStart?: (initial: DragStart) => void;
    onDragStart?: (initial: DragStart, provided: HookProvided) => void;
    onDragUpdate?: (initial: DragUpdate, provided: HookProvided) => void;
    onDragEnd: (result: DropResult, provided: HookProvided) => void;
    children?: React.ReactNode;
  }

  export class Droppable extends React.Component<DroppableProps> {}
  export class Draggable extends React.Component<DraggableProps> {}
  export class DragDropContext extends React.Component<DragDropContextProps> {}
}

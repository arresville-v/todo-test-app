export interface Todo {
  todoId: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date | string;
  createdAt?: Date | string;
  finishedDate?: Date | string;
}

export interface TodoList {
  items: Todo[];
}

export interface TodoFormValue {
  title: string;
  description: string;
  dueDate: string;
}
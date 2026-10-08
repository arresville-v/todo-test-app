import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Todo, TodoFormValue } from '../../models/todo-list.model';
import { TodoListStore } from '../../state/todo-list.store';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-todo-form',
  styleUrl: './todo-form.page.scss',
  templateUrl: './todo-form.page.html',
})
export class TodoFormPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(TodoListStore);

  isEditMode = false;
  private todoId: string | null = null;

  form: TodoFormValue = {
    title: '',
    description: '',
    dueDate: this.getDateInputValue(new Date()),
  };

  ngOnInit(): void {
    const routePath = this.route.snapshot.routeConfig?.path ?? '';
    this.todoId = this.route.snapshot.paramMap.get('todoId');
    this.isEditMode = routePath.includes('edit') || this.todoId !== null;

    if (!this.isEditMode) {
      return;
    }

    const todo = this.store.todos().find((item) => item.todoId === this.todoId);

    if (!todo) {
      this.router.navigate(['/todo-list']);
      return;
    }

    this.form = {
      title: todo.title,
      description: todo.description ?? '',
      dueDate: todo.dueDate ? this.getDateInputValue(new Date(todo.dueDate)) : this.getDateInputValue(new Date()),
    };
  }

  saveTodo(): void {
    const title = this.form.title.trim();

    if (!title) {
      return;
    }

    if (this.isEditMode && this.todoId !== null) {
      const todo = this.store.todos().find((item) => item.todoId === this.todoId);

      if (!todo) {
        this.router.navigate(['/todo-list']);
        return;
      }
      this.store.updateExistingTodo({
        ...todo,
        title,
        description: this.form.description.trim(),
        dueDate: this.form.dueDate ? new Date(this.form.dueDate) : undefined,
        createdAt: todo.createdAt ?? new Date(),
      });
    } else {
      this.store.createTodo({
        todoId: '',
        title,
        description: this.form.description.trim(),
        completed: false,
        dueDate: this.form.dueDate ? new Date(this.form.dueDate) : undefined,
        createdAt: new Date(),
      });
    }

    this.router.navigate(['/todo-list']);
  }

  cancel(): void {
    this.router.navigate(['/todo-list']);
  }

  private getDateInputValue(date: Date): string {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }
}

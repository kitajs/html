import type { FastifyInstance } from 'fastify';
import { store } from '../store';

// Todo item component
export function TodoItem({
  id,
  text,
  done
}: {
  id: number;
  text: string;
  done: boolean;
}) {
  return (
    <div
      id={`todo-${id}`}
      class="flex items-center justify-between py-1.5 border-b border-stone-800/50 last:border-0"
    >
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={done}
          hx-post={`/api/todos/${id}/toggle`}
          hx-target={`#todo-${id}`}
          hx-swap="outerHTML"
          class="w-4 h-4 rounded border-stone-600 bg-stone-800 text-kita-500 focus:ring-kita-500"
        />
        <span
          class={`text-sm ${done ? 'line-through text-stone-500' : 'text-stone-200'}`}
          safe
        >
          {text}
        </span>
      </label>
      <button
        hx-delete={`/api/todos/${id}`}
        hx-target={`#todo-${id}`}
        hx-swap="outerHTML"
        class="text-stone-500 hover:text-red-400 transition-colors text-xs"
      >
        ✕
      </button>
    </div>
  );
}

export async function todosRoutes(app: FastifyInstance) {
  app.post('/api/todos', async (req, rep) => {
    const { text } = req.body as { text: string };
    const todo = { id: store.nextTodoId++, text, done: false };
    store.todos.push(todo);
    return rep.html(<TodoItem {...todo} />);
  });

  app.post('/api/todos/:id/toggle', async (req, rep) => {
    const id = Number((req.params as { id: string }).id);
    const todo = store.todos.find((t) => t.id === id);
    if (todo) {
      todo.done = !todo.done;
      return rep.html(<TodoItem {...todo} />);
    }
    return '';
  });

  app.delete('/api/todos/:id', async (req) => {
    const id = Number((req.params as { id: string }).id);
    store.todos = store.todos.filter((t) => t.id !== id);
    return '';
  });
}

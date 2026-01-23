// Simulated data store for the demo

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const store = {
  clickCount: 0,
  todos: [
    { id: 1, text: 'Learn KitaJS Html', done: true },
    { id: 2, text: 'Try HTMX integration', done: false },
    { id: 3, text: 'Build something awesome', done: false }
  ] as Todo[],
  nextTodoId: 4
};

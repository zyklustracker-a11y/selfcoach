import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type DocumentReference,
  type Unsubscribe,
} from 'firebase/firestore'

import { dayKey } from '@/lib/dates'
import { db } from '@/lib/firebase'
import type { Todo, TodoInput, TodoWithId } from '@/types'

function todosRef(uid: string): CollectionReference<Todo> {
  return collection(db, 'users', uid, 'todos') as CollectionReference<Todo>
}

function todoRef(uid: string, todoId: string): DocumentReference<Todo> {
  return doc(db, 'users', uid, 'todos', todoId) as DocumentReference<Todo>
}

export function subscribeToTodos(
  uid: string,
  onChange: (todos: TodoWithId[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(todosRef(uid), orderBy('createdAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export async function createTodo(uid: string, input: TodoInput): Promise<string> {
  const now = serverTimestamp()
  const created = await addDoc(todosRef(uid), {
    ...input,
    // A daily task is due the day it is taken on; a principle has no date at all.
    dueDate: input.kind === 'daily' ? dayKey() : null,
    status: 'open',
    doneAt: null,
    postponedCount: 0,
    createdAt: now,
    updatedAt: now,
  })
  return created.id
}

/** Ticking off records when, which is what the implementation rate is built on. */
export async function setTodoDone(uid: string, todoId: string, done: boolean): Promise<void> {
  await updateDoc(todoRef(uid, todoId), {
    status: done ? 'done' : 'open',
    doneAt: done ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  })
}

/** Carried over to today rather than silently piling up (concept 6.4). */
export async function postponeTodo(uid: string, todo: TodoWithId): Promise<void> {
  await updateDoc(todoRef(uid, todo.id), {
    dueDate: dayKey(),
    postponedCount: todo.postponedCount + 1,
    updatedAt: serverTimestamp(),
  })
}

export async function dropTodo(uid: string, todoId: string): Promise<void> {
  await updateDoc(todoRef(uid, todoId), { status: 'dropped', updatedAt: serverTimestamp() })
}

export async function updateTodo(uid: string, todoId: string, input: TodoInput): Promise<void> {
  await updateDoc(todoRef(uid, todoId), { ...input, updatedAt: serverTimestamp() })
}

export async function deleteTodo(uid: string, todoId: string): Promise<void> {
  await deleteDoc(todoRef(uid, todoId))
}

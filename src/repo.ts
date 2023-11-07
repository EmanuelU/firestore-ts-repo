import {
  collection,
  collectionGroup,
  doc as docRef,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  type Firestore, type Query, type DocumentReference, type CollectionReference, type UpdateData, type DocumentData, type WithFieldValue
} from 'firebase/firestore'
import { type CollectionRepo, type SubCollection, type SubCollectionRepo } from './types'

function getDocRef <T, D extends DocumentData> (collection: CollectionReference<T, D>, id: string): DocumentReference<T, D> {
  return docRef<T, D>(collection, id)
}

function makeDocRef <T, D extends DocumentData> (collection: CollectionReference<T, D>): DocumentReference<T, D> {
  return docRef<T, D>(collection)
}

const fieldNameFactory = <T>() => (name: keyof T) => name

export const createCollection = <T, D extends DocumentData>(firestore: Firestore, collectionName: string): CollectionReference<T, D> => {
  return collection(firestore, collectionName) as CollectionReference<T, D>
}
export const createSubCollection = <TSub, D extends DocumentData>(collectionName: string):
SubCollection<TSub, D> => (doc: DocumentReference):
  CollectionReference<TSub, D> => collection(doc, collectionName) as CollectionReference<TSub, D>

export function createCollectionRepo<T, D extends DocumentData> (firestore: Firestore, collectionName: string): CollectionRepo<T, D> {
  const collectionRef = createCollection<T, D>(firestore, collectionName)
  return createRepoFromRef<T, D>(collectionRef)
}

export function createSubCollectionRepo<TSub, D extends DocumentData> (firestore: Firestore, parent: string, collectionName: string): SubCollectionRepo<TSub, D> {
  const parentCollection = collection(firestore, parent)
  const subCollection = createSubCollection<TSub, D>(collectionName)
  return createSubCollectionRepoFromRef<TSub, D>(subCollection, parentCollection, collectionName)
}

export function createRepoFromRef<T, D extends DocumentData> (col: CollectionReference<T, D>): CollectionRepo<T, D> {
  return {
    fieldName: fieldNameFactory<T>(),
    collection: col,
    docRef: (id: string) => getDocRef<T, D>(col, id),
    doc: async (id: string) => await getDoc<T, D>(getDocRef<T, D>(col, id)),
    makeRef: () => makeDocRef<T, D>(col),
    add: async (data: Omit<T, 'id'>) => await addDoc<Omit<T, 'id'>, D>(col, data),
    setRef: async (ref: DocumentReference<T, D>, data: WithFieldValue<T>) => await setDoc<T, D>(ref, data),
    delete: async (id: string) => await deleteDoc(getDocRef<T, D>(col, id)),
    deleteRef: async (ref: DocumentReference<T, D>) => await deleteDoc(ref),
    update: async (id: string, data: UpdateData<D>) => { await updateDoc<T, D>(getDocRef<T, D>(col, id), data) },
    updateRef: async (ref: DocumentReference<T, D>, data: UpdateData<D>) => { await updateDoc<T, D>(ref, data) }
  }
}

export function createSubCollectionRepoFromRef<TSub, D extends DocumentData> (col: SubCollection<TSub, D>, parent: CollectionReference, name: string): SubCollectionRepo<TSub, D> {
  return {
    collection: col,
    fieldName: fieldNameFactory<TSub>(),
    collectionById: (parentId: string) => col(getDocRef(parent, parentId)),
    docRef: (parentId: string, id: string) => getDocRef(col(getDocRef(parent, parentId)), id),
    doc: async (parentId: string, id: string) => await getDoc<TSub, D>(getDocRef(col(getDocRef(parent, parentId)), id)),
    new: (parentId: string) => makeDocRef<TSub, D>(col(getDocRef(parent, parentId))),
    collectionGroup: collectionGroup(parent.firestore, name) as Query<TSub, D>
  }
}

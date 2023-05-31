import {
  collection,
  collectionGroup,
  doc as docRef,
  getDoc,
  type Firestore, type Query, type DocumentReference, type CollectionReference
} from 'firebase/firestore'
import { type CollectionRepo, type SubCollection, type SubCollectionRepo } from './types'

function makeDocRef <T> (collection: CollectionReference<T>, id: string): DocumentReference<T> {
  return docRef<T>(collection, id)
}

const fieldNameFactory = <T>() => (name: keyof T) => name

export const createCollection = <T>(firestore: Firestore, collectionName: string): CollectionReference<T> => {
  return collection(firestore, collectionName) as CollectionReference<T>
}
export const createSubCollection = <TSub>(collectionName: string):
SubCollection<TSub> => (doc: DocumentReference):
  CollectionReference<TSub> => collection(doc, collectionName) as CollectionReference<TSub>

export function createCollectionRepo<T> (firestore: Firestore, collectionName: string): CollectionRepo<T> {
  const collectionRef = createCollection<T>(firestore, collectionName)
  return createRepoFromRef<T>(collectionRef)
}

export function createSubCollectionRepo<TSub> (firestore: Firestore, parent: string, collectionName: string): SubCollectionRepo<TSub> {
  const parentCollection = collection(firestore, parent)
  const subCollection = createSubCollection<TSub>(collectionName)
  return createSubCollectionRepoFromRef<TSub>(subCollection, parentCollection, collectionName)
}

export function createRepoFromRef<T> (col: CollectionReference<T>): CollectionRepo<T> {
  return {
    fieldName: fieldNameFactory<T>(),
    collection: col,
    docRef: (id: string) => makeDocRef<T>(col, id),
    doc: async (id: string) => await getDoc<T>(makeDocRef<T>(col, id))
  }
}

export function createSubCollectionRepoFromRef<TSub> (col: SubCollection<TSub>, parent: CollectionReference, name: string): SubCollectionRepo<TSub> {
  return {
    collection: col,
    fieldName: fieldNameFactory<TSub>(),
    collectionById: (parentId: string) => col(makeDocRef(parent, parentId)),
    docRef: (parentId: string, id: string) => makeDocRef(col(makeDocRef(parent, parentId)), id),
    doc: async (parentId: string, id: string) => await getDoc<TSub>(makeDocRef(col(makeDocRef(parent, parentId)), id)),
    collectionGroup: collectionGroup(parent.firestore, name) as Query<TSub>
  }
}

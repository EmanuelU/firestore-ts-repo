import {
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type UpdateData,
  type DocumentData,
  setDoc, WithFieldValue
} from 'firebase/firestore'

export type SubCollection<TSub, D extends DocumentData> = (doc: DocumentReference) => CollectionReference<TSub, D>

export type FieldNames<T> = (name: keyof T) => keyof T

/**
 * A repository for a collection.
 */
export interface CollectionRepo<T, D extends DocumentData> {
  /**
   * Helper function - makes sure you are only accessing fields that exist on the type when referring to them via string.
   * @param name
   */
  fieldName: FieldNames<T>
  /**
   * The collection reference for this repo, to be used in queries etc.
   */
  collection: CollectionReference<T, D>
  /**
   * Get a document reference by id from this collection.
   * @param id - the document id
   */
  docRef: (id: string) => DocumentReference<T, D>
  /**
   * Get a document by id from this collection.
   * @param id - the document id
   */
  doc: (id: string) => Promise<DocumentSnapshot<T, D>>
  /**
   * Get a document reference to a new document in this collection.
   */
  makeRef: () => DocumentReference<T, D>
  /**
   * Add a document to this collection.
   * Will generate a random Id for the document.
   * @param data - the data for the document
   */
  add: (data: Omit<T, 'id'>) => Promise<DocumentReference<Omit<T, 'id'>, D>>
  /**
   * Add a document reference to this collection
   * @param ref - the ref for the document
   * @param data - the data for the document
   */
  setRef: (ref: DocumentReference<T, D>, data: WithFieldValue<T>) => Promise<void>
  /**
   * Delete a document by Id from this collection.
   * @param id - the document id
   */
  delete: (id: string) => Promise<void>
  /**
   * Delete a document by reference from this collection.
   * @param ref - the ref for the document
   */
  deleteRef: (ref: DocumentReference<T, D>) => Promise<void>
  /**
   * Add a document reference to this collection.
   * @param data - the data for the document
   */
  update: (id: string, data: UpdateData<D>) => Promise<void>
  /**
   * Add a document reference to this collection.
   * @param data - the data for the document
   */
  updateRef: (ref: DocumentReference<T, D>, data: UpdateData<D>) => Promise<void>
}

/**
 * A repository for a subcollection - a collection that is nested inside a document.
 */
export interface SubCollectionRepo<T, D extends DocumentData> {
  /**
   * Helper function - makes sure you are only accessing fields that exist on the type when referring to them via string.
   * @param name
   */
  fieldName: FieldNames<T>
  /**
   * The collection reference for this subcollection, to be used in queries etc.
   * @param doc - the parent document reference
   */
  collection: SubCollection<T, D>
  /**
   * The collection reference for this subcollection, to be used in queries etc.
   * @param parentId - the parent document id
   */
  collectionById: (parentId: string) => CollectionReference<T, D>
  /**
   * Get a document reference by id from this subcollection.
   * @param parentId - the parent document id
   * @param id - the document id
   */
  docRef: (parentId: string, id: string) => DocumentReference<T, D>
  /**
   * Get a document by id from this subcollection.
   * @param parentId - the parent document id
   * @param id - the document id
   */
  doc: (parentId: string, id: string) => Promise<DocumentSnapshot<T, D>>
  /**
   * create a document.
   * @param id - the document id
   */
  new: (parentId: string) => DocumentReference<T, D>
  /**
   * Gets a query for this subcollection, uses Firestore collectionGroup method.
   * This means that if you have multiple subcollections with the same name, they will all be included in the query.
   */
  collectionGroup: Query<T, D>
}

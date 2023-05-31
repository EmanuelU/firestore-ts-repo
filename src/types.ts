import { type CollectionReference, type DocumentReference, type DocumentSnapshot, type Query } from 'firebase/firestore'

export type SubCollection<TSub> = (doc: DocumentReference) => CollectionReference<TSub>

export type FieldNames<T> = (name: keyof T) => keyof T

/**
 * A repository for a collection.
 */
export interface CollectionRepo<T> {
  /**
   * Helper function - makes sure you are only accessing fields that exist on the type when referring to them via string.
   * @param name
   */
  fieldName: FieldNames<T>
  /**
   * The collection reference for this repo, to be used in queries etc.
   */
  collection: CollectionReference<T>
  /**
   * Get a document reference by id from this collection.
   * @param id - the document id
   */
  docRef: (id: string) => DocumentReference<T>
  /**
   * Get a document by id from this collection.
   * @param id - the document id
   */
  doc: (id: string) => Promise<DocumentSnapshot<T>>
  /**
   * Get a document reference by id from this collection.
   * @param id - the document id
   */
  new: () => DocumentReference<T>
}

/**
 * A repository for a subcollection - a collection that is nested inside a document.
 */
export interface SubCollectionRepo<T> {
  /**
   * Helper function - makes sure you are only accessing fields that exist on the type when referring to them via string.
   * @param name
   */
  fieldName: FieldNames<T>
  /**
   * The collection reference for this subcollection, to be used in queries etc.
   * @param doc - the parent document reference
   */
  collection: SubCollection<T>
  /**
   * The collection reference for this subcollection, to be used in queries etc.
   * @param parentId - the parent document id
   */
  collectionById: (parentId: string) => CollectionReference<T>
  /**
   * Get a document reference by id from this subcollection.
   * @param parentId - the parent document id
   * @param id - the document id
   */
  docRef: (parentId: string, id: string) => DocumentReference<T>
  /**
   * Get a document by id from this subcollection.
   * @param parentId - the parent document id
   * @param id - the document id
   */
  doc: (parentId: string, id: string) => Promise<DocumentSnapshot<T>>
  /**
   * create a document.
   * @param id - the document id
   */
  new: (parentId: string) => DocumentReference<T>
  /**
   * Gets a query for this subcollection, uses Firestore collectionGroup method.
   * This means that if you have multiple subcollections with the same name, they will all be included in the query.
   */
  collectionGroup: Query<T>
}

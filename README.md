## Firebase Firestore Repository for TypeScript

This is a simple repository for Firebase Firestore. It is written in TypeScript and uses the Firebase v9 SDK.

The main use case is to have a single place to define your collections and subcollections, and then use them throughout your app. This way you can make sure you are only using existing fields in your types, and get IDE help for your queries.

### Installation

```npm i firestore-ts-repo```

### API
```typescript
export interface CollectionRepo<T> {
    // helper function to make sure you are only using existing fields in your type
    fieldName: FieldNames<T>
    // reference to the collection, for usage in queries updates etc.
    collection: CollectionReference<T>
    // reference to a document, for usage in queries updates etc.
    docRef: (id: string) => DocumentReference<T>
    // get the actual document
    doc: (id: string) => Promise<DocumentSnapshot<T>>
}

export interface SubCollectionRepo<T> {
    // helper function to make sure you are only using existing fields in your type
    fieldName: FieldNames<T>
    // reference to the collection, for usage in queries updates etc.
    collection: SubCollection<T>
    // enter the parent id to get a reference to the subcollection
    collectionById: (parentId: string) => CollectionReference<T>
    // reference to a document, for usage in queries updates etc.
    docRef: (parentId: string, id: string) => DocumentReference<T>
      // get the actual document
    doc: (parentId: string, id: string) => Promise<DocumentSnapshot<T>>
    // sometimes you need to query the subcollection without the parentId, this uses collectionGroup from Firestore
    collectionGroup: Query<T>
}
```

### Usage

Import your types and the helper functions from the package:
```typescript
import { type User, type Books } from './your/types';
import { type CollectionRepo, createCollectionRepo, createSubCollectionRepo, type SubCollectionRepo } from 'firestore-repo'
```

**Note:** You also need to have your **`Firestore`** instance available. 

Create a repo for your collection:
```typescript
const userRepo: CollectionRepo<User> = createCollectionRepo<User>(firestore, 'users');
```

or for a subcollection:
```typescript
const booksRepo: SubCollectionRepo<Books, User> = createSubCollectionRepo<Books>(firestore, 'users', 'books');
```

export your repo for the rest of your app to use
```typescript
const repos = {
  users: userRepo,
  books: booksRepo
}

export default repos;
```

Then you can use the repo to do common Firestore operation, with strict typing and IDE help:

### Query the collection

```typescript   
import repo from './your/repo';
import { CollectionReference } from 'firebase/firestore'

// create a query for a specific type
const q = query<User>(
  // gets the collection reference from the repo
  repo.users.collection,
  // using the fieldName helper, makes sure you are only querying on existing fields in the User type
  where(repo.users.fieldName('displayName'), '==', 'test'),
)
```

### Getting a document
```typescript   
import repo from './your/repo';

// reference to a document, for usage in queries updates etc.
const _ref: User = repo.users.docRef('some-user-id');

// or

// get the actual document
const user: User = repo.users.doc('some-user-id');
```

### Getting a document from a subcollection
```typescript   
import repo from './your/repo';

// reference to a document, for usage in queries updates etc.
const _ref: Book = repo.books.doc('some-user-id', 'some-book-id');
```


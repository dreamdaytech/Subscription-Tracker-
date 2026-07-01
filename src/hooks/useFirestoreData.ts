import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

export function useFirestoreData<T extends { id: string }>(
  user: User | null,
  collectionName: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: T[] = [];
      snapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id } as T);
      });
      setData(docs);
      setLoading(false);
    }, (err) => {
      console.error(`Error fetching ${collectionName}:`, err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, collectionName]);

  const add = async (item: Omit<T, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        userId: user.uid,
      });
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates as any);
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
    }
  };

  // setAll: Replaces the entire collection (useful for batch updates or clear)
  const clear = async () => {
    if (!user) return;
    for (const item of data) {
      await remove(item.id);
    }
  };

  return { data, loading, add, update, remove, clear };
}

import { auth, db } from "@/config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  Unsubscribe,
} from "firebase/auth";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

const userCreds = {
  email: "test@test.com",
  password: "test1234",
};
export default function Home() {
  const [uid, setUid] = useState<string | null>();

  const [users, setUsers] = useState<unknown[]>();
  const [usersListener, setUsersListener] = useState<null | { unsubscribe: Unsubscribe }>(null);
  const isListeningToUsers = !!usersListener?.unsubscribe;

  const [adminDoc, setAdminDoc] = useState<unknown>();
  const [adminListener, setAdminListener] = useState<{ unsubscribe: Unsubscribe } | null>(null);
  const isListeningToAdmin = !!adminListener?.unsubscribe;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => setUid(user?.uid ? user.uid : null));
  }, []);

  return (
    <div className="flex">
      <div className="flex-1">
        <pre>
          {JSON.stringify(
            {
              length: users?.length ? users.length : 0,
              adminDoc,
              users,
            },
            undefined,
            2
          )}
        </pre>
      </div>
      <div className="flex-1">
        {uid}
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!!uid}
          onClick={async () => {
            await createUserWithEmailAndPassword(auth, userCreds.email, userCreds.password);
            console.log(`index.tsx:${/*LL*/ 70}`, {});
          }}
        >
          create user
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!!uid}
          onClick={async () => {
            await signInWithEmailAndPassword(auth, userCreds.email, userCreds.password);
            console.log(`index.tsx:${/*LL*/ 86}`, {});
          }}
        >
          log in
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!uid}
          onClick={async () => {
            await signOut(auth);
            console.log(`index.tsx:${/*LL*/ 98}`, {});
          }}
        >
          log out
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!uid}
          onClick={async () => {
            console.log(`index.tsx:${/*LL*/ 109}`, {
              uid: auth.currentUser?.uid,
            });
          }}
        >
          log user id
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!uid}
          onClick={async () => {
            const newId = v4();
            await setDoc(doc(db, "users", newId), { id: newId });
            console.log(`index.tsx:${/*LL*/ 124}`, { newId });
          }}
        >
          set new user
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!uid}
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            await setDoc(doc(db, "admins", uid), { id: uid });
            console.log(`index.tsx:${/*LL*/ 139}`, {});
          }}
        >
          set current user as admin
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={!uid}
          onClick={async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            await deleteDoc(doc(db, "admins", uid));
            console.log(`index.tsx:${/*LL*/ 154}`, {});
          }}
        >
          remove current user as admin
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={isListeningToUsers}
          onClick={async () => {
            try {
              const newUnsubscribe = onSnapshot(
                collection(db, "users"),
                (docsSnap) => {
                  console.log(`index.tsx:${/*LL*/ 169}`, {
                    snap: docsSnap,
                    docs: docsSnap.docs,
                  });
                  setUsers(() => docsSnap.docs.map((doc) => doc.data()));
                },
                () => {
                  const currentUnsubscribe = usersListener?.unsubscribe;
                  if (currentUnsubscribe) currentUnsubscribe();
                  setUsers(() => []);
                }
              );
              setUsersListener({ unsubscribe: newUnsubscribe });
            } catch (error) {
              console.log(`index.tsx:${/*LL*/ 184}`, { error });
            }
          }}
        >
          listen to users
        </button>
        <br />
        <br />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-slate-500"
          disabled={isListeningToAdmin}
          onClick={async () => {
            try {
              if (!uid) return;

              const newUnsubscribe = onSnapshot(
                doc(db, "admins", uid),
                (docSnap) => {
                  console.log(`index.tsx:${/*LL*/ 202}`, {
                    snap: docSnap,
                    doc: docSnap.data(),
                  });
                  const data = docSnap.data();
                  setAdminDoc(data);
                  if (docSnap.metadata.hasPendingWrites) return;

                  if (data) return;

                  adminListener?.unsubscribe();
                  usersListener?.unsubscribe();

                  setAdminListener(null);
                  setAdminDoc(() => null);

                  setUsersListener(null);
                  setUsers(() => []);
                },
                () => {}
              );
              setAdminListener({ unsubscribe: newUnsubscribe });
            } catch (error) {
              console.log(`index.tsx:${/*LL*/ 225}`, { error, message: "this shouldn't occur" });
            }
          }}
        >
          listen to admin
        </button>
      </div>
    </div>
  );
}

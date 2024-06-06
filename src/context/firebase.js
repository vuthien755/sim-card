import { initializeApp } from "firebase/app";
import { collection, setDoc, getDocs, getFirestore, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAMlGqi7u-DTw_tMlvJNYaiBhG0cLl9feA",
  authDomain: "versatile-field-373011.firebaseapp.com",
  databaseURL: "https://versatile-field-373011-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "versatile-field-373011",
  storageBucket: "versatile-field-373011.appspot.com",
  messagingSenderId: "155265849441",
  appId: "1:155265849441:web:8e74285ed73495016d7220",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handleWrite = async (index, id, data) => {
  try {
    await setDoc(doc(db, `sim-card${index}`, id), data);
  } catch (e) {
    console.error("Error set document: ", e);
  }
};

export const updateAmountCollection = async (amount) => {
  try {
    await setDoc(doc(db, "total-collection", "number"), amount);
  } catch (error) {}
};

export const handleRead = async (callback) => {
  const data = [];
  const querySnapshot = await getDocs(collection(db, "sim-card"));
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  callback(data);
};

export const handleDelete = async (index, id) => {
  await deleteDoc(doc(db, `sim-card${index}`, id));
};

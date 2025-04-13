
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {
    getDatabase,
    ref,
    push,
    onValue,
    remove
  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

  // Your Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyCDseTCM-C2JDRsOuKb129UMWN-V2n2VvU",
    authDomain: "nexus-10d33.firebaseapp.com",
    databaseURL: "https://nexus-10d33-default-rtdb.firebaseio.com",
    projectId: "nexus-10d33",
    storageBucket: "nexus-10d33.firebasestorage.app",
    messagingSenderId: "893339315389",
    appId: "1:893339315389:web:0b74a2e774968ca9675bd4",
    measurementId: "G-JXSC97HPBS"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getDatabase(app);

  // Register
  window.register = () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, pass)
      .then(() => alert("Registered successfully"))
      .catch(err => alert(err.message));
  };

  // Login
  window.login = () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, pass)
      .then(() => alert("Logged in"))
      .catch(err => alert(err.message));
  };

  // Logout
  window.logout = () => {
    signOut(auth).then(() => alert("Logged out"));
  };

  // Post a blog
  window.postBlog = () => {
    const blog = document.getElementById("blogContent").value;
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to post!");

    const blogRef = ref(db, 'blogs/');
    push(blogRef, {
      content: blog,
      date: new Date().toLocaleString(),
      uid: user.uid,
      userEmail: user.email
    });

    document.getElementById("blogContent").value = '';
  };

  // Delete a blog
  function deleteBlog(id) {
    const blogRef = ref(db, 'blogs/' + id);
    remove(blogRef)
      .then(() => alert("Blog deleted"))
      .catch(err => alert("Error deleting: " + err.message));
  }

  // Display blogs
  const blogList = document.getElementById("blog-list");
  const blogsRef = ref(db, 'blogs/');

  onValue(blogsRef, snapshot => {
    blogList.innerHTML = '';
    const user = auth.currentUser;

    snapshot.forEach(child => {
      const blog = child.val();
      const blogId = child.key;

      const div = document.createElement('div');
      div.className = "bg-white p-4 rounded shadow mb-4";
      div.innerHTML = `
        <p class="text-lg">${blog.content}</p>
        <small class="text-gray-500">Posted by: ${blog.userEmail || "Anonymous"} on ${blog.date}</small>
      `;

      if (user && user.uid === blog.uid) {
        const delBtn = document.createElement("button");
        delBtn.innerText = "Delete";
        delBtn.className = "bg-red-500 text-white px-2 py-1 ml-2 rounded mt-2";
        delBtn.onclick = () => deleteBlog(blogId);
        div.appendChild(delBtn);
      }

      blogList.prepend(div);
    });
  });

  // Optional: Track auth state
  onAuthStateChanged(auth, user => {
    const status = document.getElementById("status");
    if (user) {
      status.innerText = `Logged in as: ${user.email}`;
    } else {
      status.innerText = "Not logged in";
    }
  });


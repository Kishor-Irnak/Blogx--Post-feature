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
  remove,
  set
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Firebase config
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
getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

const blogList = document.getElementById("blog-list");

// Register
window.register = () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const username = document.getElementById("username").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(cred => {
      const userRef = ref(db, 'users/' + cred.user.uid);
      return set(userRef, {
        email: email,
        username: username
      });
    })
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

  const userRef = ref(db, 'users/' + user.uid);
  onValue(userRef, snapshot => {
    const userData = snapshot.val();

    const blogRef = ref(db, 'blogs/');
    push(blogRef, {
      content: blog,
      date: new Date().toLocaleString(),
      uid: user.uid,
      userEmail: user.email,
      username: userData.username,
      likedBy: {},
      comments: []
    });

    document.getElementById("blogContent").value = '';
  }, { onlyOnce: true });
};

// Delete a blog
function deleteBlog(id) {
  const blogRef = ref(db, 'blogs/' + id);
  remove(blogRef)
    .then(() => alert("Blog deleted"))
    .catch(err => alert("Error deleting: " + err.message));
}

// Like a blog
import { get, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

window.likeBlog = async (id) => {
  const user = auth.currentUser;
  if (!user) return alert("Login to like!");

  const blogRef = ref(db, 'blogs/' + id);

  try {
    const snapshot = await get(blogRef);
    const blogData = snapshot.val();

    const likedBy = blogData.likedBy || {};
    const userLiked = likedBy[user.uid];

    // Toggle like
    likedBy[user.uid] = !userLiked;

    await update(blogRef, { likedBy });
  } catch (err) {
    console.error("Error liking blog:", err);
  }
};

// Add a comment
window.addComment = (id) => {
  const user = auth.currentUser;
  if (!user) return alert("Login to comment!");

  const commentInput = document.getElementById(`comment-${id}`);
  const text = commentInput.value;

  const userRef = ref(db, 'users/' + user.uid);
  onValue(userRef, snapshot => {
    const userData = snapshot.val();
    const commentRef = ref(db, 'blogs/' + id + '/comments');
    push(commentRef, {
      text: text,
      user: userData.username
    });
    commentInput.value = '';
  }, { onlyOnce: true });
};

// Show blogs
const blogsRef = ref(db, 'blogs/');
onValue(blogsRef, snapshot => {
  blogList.innerHTML = '';
  const user = auth.currentUser;

  snapshot.forEach(child => {
    const blog = child.val();
    const blogId = child.key;
    const likeCount = blog.likedBy ? Object.keys(blog.likedBy).length : 0;
    const comments = blog.comments ? Object.values(blog.comments) : [];

    const div = document.createElement('div');
    div.className = "bg-white p-4 rounded shadow mb-4";
    div.innerHTML = `
      <p class="text-lg">${blog.content}</p>
      <small class="text-gray-500">Posted by: ${blog.username || blog.userEmail} on ${blog.date}</small>
      <div class="flex items-center mt-2">
        <button onclick="likeBlog('${blogId}')" class="text-red-500 text-xl">❤️</button>
        <span class="ml-2 text-sm">${likeCount} likes</span>
      </div>
      <div class="mt-2">
        <input id="comment-${blogId}" class="border p-1 w-full" placeholder="Add a comment..." />
        <button onclick="addComment('${blogId}')" class="bg-blue-500 text-white px-2 py-1 mt-1">Comment</button>
        <div class="mt-2 space-y-1 text-sm text-gray-700">
          ${comments.map(c => `<p><b>${c.user}:</b> ${c.text}</p>`).join('')}
        </div>
      </div>
    `;

    if (user && user.uid === blog.uid) {
      const delBtn = document.createElement("button");
      delBtn.innerText = "Delete";
      delBtn.className = "bg-red-500 text-white px-2 py-1 mt-2 rounded";
      delBtn.onclick = () => deleteBlog(blogId);
      div.appendChild(delBtn);
    }

    blogList.prepend(div);
  });
});

// Auth status
onAuthStateChanged(auth, user => {
  const status = document.getElementById("status");
  if (user) {
    status.innerText = `Logged in as: ${user.email}`;
  } else {
    status.innerText = "Not logged in";
  }
});

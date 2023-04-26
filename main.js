const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
function generateId() {
  return +new Date();
}
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}
function addBook() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const IsCompleted = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, bookYear, IsCompleted);
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function removeBookToCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      if (bookTarget === -1) return;
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      Swal.fire("Deleted!", "Your book has been deleted.", "success");
    }
  });
}
function undoBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
function makeBook(bookObject) {
  const titleBook = document.createElement("h2");
  titleBook.innerText = bookObject.title;
  const authorBook = document.createElement("p");
  authorBook.innerText = `Penulis: ${bookObject.author} `;
  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun  : ${bookObject.year} `;
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");
  const container = document.createElement("article");
  container.classList.add("book_item");
  container.setAttribute("id", `book-${bookObject.id}`);
  container.append(titleBook, authorBook, bookYear);
  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.setAttribute("id", "button-undo");
    undoButton.addEventListener("click", function () {
      undoBookToCompleted(bookObject.id);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.setAttribute("id", "trash-button");
    trashButton.addEventListener("click", function () {
      removeBookToCompleted(bookObject.id);
    });
    buttonContainer.append(undoButton, trashButton);
    container.append(buttonContainer);
  } else {
    const undoButton = document.createElement("button");
    undoButton.classList.add("check-button");
    undoButton.setAttribute("id", "button-undo");
    undoButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.setAttribute("id", "trash-button");
    trashButton.addEventListener("click", function () {
      removeBookToCompleted(bookObject.id);
    });
    buttonContainer.append(undoButton, trashButton);
    container.append(buttonContainer);
  }
  return container;
}
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
const checkbox = document.getElementById("inputBookIsComplete");
let check = false;
checkbox.addEventListener("change", function (bookItem) {
  if (checkbox.checked) {
    check = true;
    document.querySelector("span").innerText = "Selesai dibaca";
  } else {
    check = false;
    document.querySelector("span").innerText = "Belum selesai dibaca";
  }
});
document.getElementById("searchBook").addEventListener("submit", function (event) {
  event.preventDefault();
  const searchBook = document.getElementById("searchBookTitle").value.toLowerCase();
  const bookList = document.querySelectorAll(".book_item > h2");
  for (const book of bookList) {
    if (book.innerText.toLowerCase().includes(searchBook)) {
      book.parentElement.style.display = "block";
    } else {
      book.parentElement.style.display = "none";
    }
  }
});
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  const completeBookshelfList = document.getElementById("completeBookshelfList");
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Your book has been saved",
      showConfirmButton: false,
      timer: 1000,
    });
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

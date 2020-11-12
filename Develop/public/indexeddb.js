let db;
//new db request for a budget databse
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result
    //creating an object store called pending with auto increment as true
    db.createObjectStore("pending", {autoIncrement: true});
};

request.onsuccess = function (event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  
  request.onerror = function (event) {
    console.log(event.target.errorCode);
  };
  
  function saveRecord(record) {
          const transaction = db.transaction(["pending"], "readwrite");
          const pendingObjectStore = transaction.objectStore("pending");
          pendingObjectStore.add(record);
  } 
  
  function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingObjectStore = transaction.objectStore("pending");
    const getAll = pendingObjectStore.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then(() => {
            const transaction = db.transaction(["pending"], "readwrite");
            const pendingObjectStore = transaction.objectStore("pending");
            pendingObjectStore.clear()
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', checkDatabase);
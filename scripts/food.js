import {
  createSortByCategoryContainer,
  displayFoodItemsByCategory,
  displayFoodItemsByExpiryDate,
  displayFoodItemsByName,
  createSortByDateContainer,
  createSortByNameContainer,
} from "./sort-food.js";

var currentUser;
// split path by \ and get the last one
const editForm = document.querySelector(".js-edit-form");
var foodImage = document.getElementById("imageUpload");
var foodName = document.getElementById("nameInput");
var foodExpiryDate = document.getElementById("datepickerInput");
var foodStorage = document.getElementById("storageSpaceInput");
var foodCategory = document.getElementById("categoryInput");
var foodQuantity = document.getElementById("quantityInput");
var foodNotes = document.getElementById("notesInput");
const emptyKitchenMessageTemplate = document.querySelector(
  "#emptyKitchenMessageTemplate"
);
const emptyKitchenMessage = document.querySelector("#emptyKitchenMessage");
const searchBar = document.querySelector(".js-search-bar");


// MAIN FUNCTION FOR MY KITCHEN PAGE
// Get the currently signed-in user
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // console.log("current user", user)
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/v8/firebase.User
        var userID = user.uid;

        if (editForm) {
            // Edit form page
            populateFoodInfo();
        } else {
            // My Kitchen page


            db.collection("users").doc(userID).collection("food").get().then(subCollection => {

                if (emptyKitchenMessage && searchBar) {
                    // When food subcollection has more than one entry
                    if (subCollection.docs.length > 0) {
                        console.log('food collection exists');
                        
                        let spaceName = getURLParams('storage');
                        console.log(spaceName);
                        createStorageSpaceDropdown(userID);
                        displayFoodByStorageSpace(userID, spaceName);
                        // createSortByCategoryContainer(userID);
                        // displayFoodItemsByCategory(userID);
                    // When food subcollection has no documents
                    } else {
                        console.log('food collection does not exist');
                        let node = emptyKitchenMessageTemplate.content.cloneNode(true);
                        emptyKitchenMessage.appendChild(node);
                        searchBar.style.display = "none";
                    }
                }
            });
            
        }

    const saveBtn = document.querySelector(".save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (editForm) {
          // Edit form page
          updateFoodItem(userID);
        } else {
          // Add form page
          writeFood(userID);
        }
      });
    }
  } else {
    console.log("No user is signed in");
    window.location.href = "login.html";
  }
});

// Add food items
function writeFood(userID) {
  // Add a new document inside users > food (sub collection)
  var foodRef = db.collection("users").doc(userID).collection("food");
  let foodSlug = slugify(foodName.value);

  foodRef
    .add({
      userID: userID,
      title: foodName.value,
      slug: foodSlug,
      expiry_date: foodExpiryDate.value,
      category: foodCategory.value,
      storage_space: foodStorage.value,
      quantity: foodQuantity.value,
      image: foodImage.value.split("\\").pop(),
      notes: foodNotes.value,
      date_created: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then((foodRef) => {
      console.log("Document written with ID:", foodRef);
      window.location.href = "mykitchen.html";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

// function getStorageSpace() {
//     let spaceName = getURLParams('storage');
//     console.log(spaceName);
//     // var spaceName = 'All Spaces'; 
//     // const storageDropdown = document.querySelector('.js-storage-dropdown');
//     // const storageSpaces = storageDropdown.querySelectorAll('a');
//     // storageSpaces.forEach((storageSpace) => {
//     //     storageSpace.addEventListener("click", (event) => {
//     //         event.preventDefault();
//     //         spaceName = storageSpace.querySelector('.js-storage-space').textContent;
//     //     });
//     // })

//     return spaceName;
// }

function createStorageSpaceDropdown(userID) {
    let storageDropdownTemplate = document.getElementById("storageDropdownTemplate");
    let storageSpaceDropdown = document.getElementById("storageSpaceDropdown");
    var storageSpaceList = ['Fridge', 'Freezer', 'Pantry', 'Other'];

    // Step 1: Handle the "All Spaces" entry first
    let allFoodItems = db.collection("users").doc(userID).collection("food");
    allFoodItems.get().then((doc) => {
        let allSpacesSize = doc.size;
        
        // Clone the template for "All Spaces"
        let allSpacesBtn = storageDropdownTemplate.content.cloneNode(true);

        // Update the number of items for "All Spaces"
        let allSpacesNumElement = allSpacesBtn.querySelector(".js-storage-space-num");
        if (allSpacesNumElement) {
            allSpacesNumElement.innerHTML = `${allSpacesSize} items`;
        }

        // Update the title for "All Spaces" directly in the anchor tag
        let allSpacesLinkElement = allSpacesBtn.querySelector("a");
        if (allSpacesLinkElement) {
            allSpacesLinkElement.href = "mykitchen.html?storage=all_spaces"; // or whatever URL for all spaces
            allSpacesLinkElement.querySelector(".js-storage-space-title").innerHTML = "All Spaces";
        }

        // Append the "All Spaces" button to the dropdown
        storageSpaceDropdown.appendChild(allSpacesBtn);

        // Add the underline only under "All Spaces"
        let underlineDiv = document.createElement("div");
        underlineDiv.classList.add("tw-w-[90%]", "tw-h-[1px]", "tw-bg-neutral-light", "tw-mx-auto");
        storageSpaceDropdown.appendChild(underlineDiv);


        // Step 2: Handle individual storage spaces (Fridge, Freezer, Pantry, Other)
        storageSpaceList.forEach((space) => {
            let filteredItems = db.collection("users").doc(userID).collection("food").where("storage_space", "==", space).get().then((doc) => {
                let spaceSize = doc.size;

                // Clone the template for each individual space
                let spaceBtn = storageDropdownTemplate.content.cloneNode(true);

                // Find and update the number of items for the storage space
                let spaceNumElement = spaceBtn.querySelector(".js-storage-space-num");
                if (spaceNumElement) {
                    spaceNumElement.innerHTML = `${spaceSize} items`;
                }

                // Find and update the title for the storage space
                let spaceTitleElement = spaceBtn.querySelector(".js-storage-space-title");
                if (spaceTitleElement) {
                    spaceTitleElement.innerHTML = space;
                }

                // Append to the dropdown
                storageSpaceDropdown.appendChild(spaceBtn);
            });
        });
    });
}


    // filteredItems.get().then((doc) => {
        
    // })
    // ref
    // .get()
    // .then((doc) => {
    //     console.log(doc);
    //     let totalAmount = doc.size;
    //     console.log(totalAmount);
    //     // let spaceBtn = storageDropdownTemplate.content.cloneNode(true);
    //     // spaceBtn.querySelector(".js-storage-space-title").innerHTML = totalAmount;
    //     // storageSpaceDropdown.appendChild(spaceBtn);
    // });


// Display Food items on My Kitchen page
function displayFoodByStorageSpace(userID, storageSpace) {

    let foodItemTemplate = document.querySelector("#foodItemTemplate");
    let foodItemList = document.querySelector("#foodItemList");

    if (foodItemList && foodItemTemplate) {
        let allFoodItems = db.collection("users").doc(userID).collection("food");
        let filteredItems = db.collection("users").doc(userID).collection("food")
        .where("storage_space", "==", convertToTitleCase(storageSpace)); 

        let ref = storageSpace == "all_spaces" ? allFoodItems : filteredItems;
        ref
        .get()
        .then((allItems) => {
            allItems.forEach((doc) => {
                // console.log(doc.id, " => ", doc.data());
                let docID = doc.id;
                let title = doc.data().title;
                let slug = doc.data().slug;
                let expiry_date = doc.data().expiry_date;
                let category = doc.data().category;
                let storage_space = doc.data().storage_space;
                let quantity = doc.data().quantity;
                let image = doc.data().image;
                let notes = doc.data().notes;
                let dateCreated = doc.data().date_created;
                let daysLeft = calculateTimeLeft(expiry_date)
                // let currentTime = new Date().toLocaleString();

                // console.log(title, expiry_date, category, storage_space, quantity, image, notes, "dateCreated", dateCreated, "daysLeft", daysLeft)

                // Copy the content of template
                let foodItemCard = foodItemTemplate.content.cloneNode(true);

                // Populate card content
                foodItemCard.querySelector(".food-title").innerHTML = title;
                foodItemCard.querySelector(".food-link").href = '/eachFood.html?docID=' + docID;

                foodItemCard.querySelector(".food-days-left").innerHTML =  determineRemainingDaysMessage(daysLeft, expiry_date)
                foodItemCard.querySelector(".food-quantity").innerHTML = `Quantity: ${quantity}`;
                foodItemCard.querySelector(".food-img").src = `../images/icons/food/${image}`;

                foodItemList.appendChild(foodItemCard);

            })

        })

    }
}

function calculateTimeLeft(date) {
  // Define two Date objects representing the start and end dates
  const currentDate = Date.now(); // Current date and time in milliseconds
  const expiryDate = new Date(date);

  // Calculate the time difference in milliseconds
  var timeDifference = expiryDate - currentDate;

  // Calculate the time left in days

  var timeDifferenceDays = Math.floor(timeDifference / 86400000);

  return timeDifferenceDays;
}

function determineRemainingDaysMessage(daysLeft, date) {
  // determine remaining days message
  let message;
  switch (true) {
    case daysLeft === 0:
      message = "Today";
      break;
    case daysLeft === 1:
      message = "Tomorrow";
      break;
    case daysLeft < 0:
      message = `${Math.abs(daysLeft)} days past`;
      break;
    case daysLeft > 5 && !editForm:
      message = date;
      break;
    default:
      message = `${daysLeft} days left`;
      break;
  }

  return message;
}

document.addEventListener("DOMContentLoaded", () => {
  const btnAddItem = document.querySelector(".btn-add-item");
  const addOverlay = document.querySelector(".add-overlay");
  if (!btnAddItem || !addOverlay) {
    return;
  }

  // Show/Hide Add overlay when clicking on the plus icon
  btnAddItem.addEventListener("click", (event) => {
    if (addOverlay.classList.contains("is-active")) {
      addOverlay.classList.remove("is-active");
    } else {
      addOverlay.classList.add("is-active");
    }
  });

  // Close overlay when clicking outside of it
  document.addEventListener("click", (event) => {
    // overlay open, not clicking inside of overlay or add button
    if (
      addOverlay.classList.contains("is-active") &&
      !addOverlay.contains(event.target) &&
      !btnAddItem.contains(event.target)
    ) {
      // Close overlay
      addOverlay.classList.remove("is-active");
    }
  });
});

// Preview Uploaded Image File before server submission
function previewFile(input) {
  var file = $("input[type=file]").get(0).files[0];

  if (file) {
    var reader = new FileReader();

    reader.onload = function () {
      $("#previewImg").attr("src", reader.result);
    };

    reader.readAsDataURL(file);
  }
}

function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ""); // trim leading/trailing white space
  str = str.toLowerCase(); // convert string to lowercase
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
  return str;
}

function convertToTitleCase(str) {
    if (!str) {
        return ""
    }
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
  }
  

function getURLParams(key) {
  const params = new URL(window.location.href).searchParams; // get the url from the search bar and its search parameters
  const value = params.get(key);

  return value;
}

function populateFoodInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("populateFoodInfo");
      var foodItemRef = db
        .collection("users")
        .doc(user.uid)
        .collection("food")
        .doc(getURLParams('docID'));
      foodItemRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            //get the data fields of the food item
            let title = doc.data().title;
            let expiry_date = doc.data().expiry_date;
            let category = doc.data().category;
            let storage_space = doc.data().storage_space;
            let quantity = doc.data().quantity;
            let image = doc.data().image;
            let notes = doc.data().notes;
            let dateCreated = doc.data().date_created;
            let daysLeft = calculateTimeLeft(expiry_date);

            //if the data fields are not empty, then write them in to the form.
            if (title != null) {
              document.querySelector(".js-edit-form #nameInput").value = title;
            }
            if (expiry_date != null) {
              document.querySelector(".js-edit-form #datepickerInput").value =
                expiry_date;
            }
            if (category != null) {
              document.querySelector(".js-edit-form #categoryInput").value =
                category;
            }
            if (storage_space != null) {
              document.querySelector(".js-edit-form #storageSpaceInput").value =
                storage_space;
            }
            if (quantity != null) {
              document.querySelector(".js-edit-form #quantityInput").value =
                quantity;
            }
            if (image != null) {
              document.querySelector(
                ".js-edit-form #previewImg"
              ).src = `../images/icons/food/${image}`;
            }
            if (notes != null) {
              document.querySelector(".js-edit-form #notesInput").value = notes;
            }
            if (daysLeft != null) {
              document.querySelector(
                ".js-edit-form .js-days-remaining"
              ).innerHTML = determineRemainingDaysMessage(
                daysLeft,
                expiry_date
              );
            }
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  });
}

function updateFoodItem(userID) {
  // Update doc with new data input inside users > food (sub collection)
  var foodRef = db
    .collection("users")
    .doc(userID)
    .collection("food")
    .doc(getURLParams('docID'));
  let foodSlug = slugify(foodName.value);

  foodRef
    .update({
      userID: userID,
      title: foodName.value,
      slug: foodSlug,
      expiry_date: foodExpiryDate.value,
      category: foodCategory.value,
      storage_space: foodStorage.value,
      quantity: foodQuantity.value,
      image: foodImage.value.split("\\").pop(),
      notes: foodNotes.value,
      date_updated: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then((foodRef) => {
      console.log("Document updated with ID:", foodRef);
      window.location.href = "mykitchen.html";
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

export { calculateTimeLeft, determineRemainingDaysMessage };

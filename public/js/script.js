const searchButton = document.getElementById('searchbtn');
const search = document.getElementById('searchBar');
const searchInfo = document.getElementById('searchInfo');
const searchRes = document.getElementById('searchRes');


function addBorrowEvents(elmClass = '') {
    const element = document.getElementsByClassName(elmClass)
    for (let i = 0; i < element.length; i++) {

        element[i].addEventListener('click', (e) => {
            const id = e.target.dataset.bookid;
            fetch('http://localhost:5000/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
                .then((result) => {
                    return result.json();
                })
                .then(() => {
                    e.target.setAttribute('disabled', 'true');
                })
                .catch((error) => {
                    throw new Error(error);
                })
        })
    }
}

function borrowCheck(id, pendingRequest = [], borrowers = []) {
    return pendingRequest.includes(id) || borrowers.includes(id) ? 'disabled = true' : '';
}

searchButton.addEventListener('click', () => {
    searchRes.innerHTML = ''
    searchInfo.classList.remove('hidden');
    searchInfo.textContent = `Search results for '${search.value}'`;

    fetch(`http://localhost:5000/api/books/${search.value}`)
        .then((result) => {
            return result.json()
        })
        .then((books) => {
            books.searchRes.forEach(book => {
                searchRes.classList.remove('hidden');
                searchRes.innerHTML +=
                    `<div class="book">
            <div class="image bookInfo">
            <img src="../public/images/${book.item.imageUrl}.jpeg" alt="${book.item.title} book preview image">
            </div>
            <span class="bookInfo" id="title">Title: ${book.item.title}</span>
            <span class="bookInfo" id="price">Price: $${book.item.price}</span>
            <span class="bookInfo" id="price">Description: ${book.item.desc}</span>
            <!-- Add other book info here -->
            <div class="bookInfo" id="btns">
            <input type="button" value="Borrow" ${borrowCheck(books.currentUserId, book.item.pendingBorrower, book.item.borrowers)} class="choices borrowSearch" data-bookid="${book.item._id}"/>
            <input type="button" value="Add To Wishlist" class="choices" id="wishlist" />
            </div>
            </div>`
                //add borrow functionality to searched books
                addBorrowEvents('borrowSearch');
            });
        })
        .catch((error) => {
            console.log(error);
            throw new Error(error);
        })
})

//add borrow functionality to all books
addBorrowEvents('borrow');

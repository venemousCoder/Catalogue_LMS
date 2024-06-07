const deleteBtns = document.getElementsByClassName('delete');
// const updateBtns = document.getElementsByClassName('update');

function updateDeleteAction(elmClass) {
    for (let i = 0; i < elmClass.length; i++) {
        elmClass[i].addEventListener('click', (e) => {
            console.log(e.target.dataset);
            // confirm('Are you sure you want to delete this book');
            const method = e.target.dataset.method;
            const id = e.target.dataset.bookid;
            fetch(`http://localhost:5000/admin/moderator/book/${id}?_method=${method}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
                .then((result) => {
                    if (method === 'delete') {
                        e.target.parentNode.parentNode.remove();
                        return result.json();
                    }
                    return result.json();
                })
                .then(() => {
                    console.log('Book Updated');
                })
                .catch((error) => {
                    console.log(error);
                    return error
                })
        })
    }
}

updateDeleteAction(deleteBtns);

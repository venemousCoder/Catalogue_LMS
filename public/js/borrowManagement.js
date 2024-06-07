function bookReturning(elmClass = '') {
    const element = document.getElementsByClassName(elmClass);
    for (let i = 0; i < element.length; i++) {
        element[i].addEventListener('click', (e) => {
            const method = e.target.dataset.method
            const id = e.target.dataset.userid;
            const bookid = e.target.dataset.bookid;
            fetch(`http://localhost:5000/admin/borrowmanagement/?_method=${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, bookid })
            })
                .then((result) => {
                    e.target.parentNode.parentNode.remove();
                    return result.json();
                })
                .then(() => {
                    console.log('returnred');
                })
                .catch((error) => {
                    throw new Error(error);
                })
        })
    }
}

bookReturning('choices')
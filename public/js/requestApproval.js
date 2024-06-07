
function addBorrowEvents(elmClass = '') {
    const element = document.getElementsByClassName(elmClass);
    for (let i = 0; i < element.length; i++) {
        element[i].addEventListener('click', (e) => {
            const method = e.target.dataset.method
            const id = e.target.dataset.requestid;
            fetch(`http://localhost:5000/admin/notifications/?id=${id}&_method=${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
                .then((result) => {
                    e.target.parentNode.parentNode.remove();
                    return result.json();
                })
                .then(() => {
                    console.log('Request updated');
                })
                .catch((error) => {
                    throw new Error(error);
                })
        })
    }
}

addBorrowEvents('approve');
addBorrowEvents('decline');
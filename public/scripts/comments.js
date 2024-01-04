const loadsComments = document.getElementById('loadsComments');
const postPane = document.querySelector('.postPane');

async function fetchComments(e){
    const postId = e.target.dataset.postnumber;
    const result = await fetch(`/all-post/${postId}/comments`);
    
    const data = await result.json();
    console.log(data);

        const p = document.createElement('p');

        if(data.length==0){
            p.innerHTML = "";
            p.innerHTML = `<h2>No Comments</h2>`;
            postPane.appendChild(p);
            loadsComments.style.display = 'none';
            return;
        }
    
        p.innerHTML = `<h2>${data.length} Comments</h2>`;
        postPane.appendChild(p);

        for(key of data){
        const li = document.createElement('li');
        li.innerHTML = ` <div id="post-pane2">

        <h3>${key.comment}</h3>
        <p class="detailsNav"><img src="${key.autherPic}" alt="picture" id="mainImage3"> commented by ${key.authorPost} | <span class = "timeDate"> &nbsp${key.date}</span></p>
       
    </div>`

    postPane.appendChild(li);
    
    }

    loadsComments.style.display = 'none';
}

loadsComments.addEventListener('click', fetchComments);

 
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const contentDiv = document.getElementById('content');
    data.forEach(item => {
      const post = document.createElement('div');
      post.className = 'post';
      post.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p>`;
      contentDiv.appendChild(post);
    });
  })
  .catch(error => console.error('Error loading JSON:', error));
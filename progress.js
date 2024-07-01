document.addEventListener("DOMContentLoaded", function() {
    const textContainer = document.querySelector('.text-container');
    const progressBar = document.getElementById('progress-bar');

    textContainer.addEventListener('scroll', () => {
        const containerHeight = textContainer.scrollHeight - textContainer.clientHeight;
        const scrollPosition = textContainer.scrollTop;
        const width = (scrollPosition / containerHeight) * 100;
        progressBar.style.width = width + '%';
    });
});
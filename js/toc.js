document.addEventListener('DOMContentLoaded', () => {
    const toc = document.getElementById('toc');
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.container');

    // Store initial TOC dimensions and position
    let tocWidth, tocLeft;
    let isSticky = false;

    function updateTocPosition() {
        const rect = toc.getBoundingClientRect();
        tocWidth = rect.width; // Captures new width including logo
        tocLeft = rect.left;
    }

    // Update position on load and resize
    updateTocPosition();
    window.addEventListener('resize', updateTocPosition);

    // Debounce function to prevent rapid scroll event triggers
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Sticky TOC when it reaches the top of the viewport
    const handleScroll = debounce(() => {
        const tocTop = toc.getBoundingClientRect().top;
        // Buffer zone: become sticky when at viewport top, unstick when scrolling back 50px
        if (tocTop <= 0 && !isSticky) {
            isSticky = true;
            toc.classList.add('sticky');
            toc.style.width = `${tocWidth}px`;
            toc.style.left = `${tocLeft}px`;
        } else if (tocTop > 50 && isSticky) {
            isSticky = false;
            toc.classList.remove('sticky');
            toc.style.width = '';
            toc.style.left = '';
        }
    }, 10);

    window.addEventListener('scroll', handleScroll);

    // Highlight active section
    const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -50% 0px', // Adjust to trigger when section is near top
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.toc-link[href="#${id}"]`);
            if (entry.isIntersecting) {
                tocLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Smooth scrolling for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            window.scrollTo({
                top: targetSection.offsetTop - 100, // Adjust for sticky TOC height
                behavior: 'smooth'
            });
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
    /* ----------- grab nav + links --------------------- */
    const toc      = document.getElementById('toc');
    const tocLinks = document.querySelectorAll('.toc-link');
  
    /* ----------- sections incl. the new #top ---------- */
    /** ❶ **/
    const sections = [
      document.getElementById('top'),           // intro sentinel
      ...document.querySelectorAll('.container')// #section1, #section2 …
    ];
  
    /* ---------- sticky code (unchanged) --------------- */
    /* ...handleScroll debounce stuff stays exactly as before... */
  
    /* ---------- active‑section highlight -------------- */
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const id   = entry.target.getAttribute('id');
        const link = document.querySelector(`.toc-link[href="#${id}"]`);
        if(link){
          tocLinks.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, {root:null, rootMargin:'-100px 0px -50% 0px', threshold:0});
  
    sections.forEach(sec=>observer.observe(sec));
  
    /* ---------- smooth scroll for clicks -------------- */
    tocLinks.forEach(link=>{
      link.addEventListener('click', e=>{
        e.preventDefault();
        const href = link.getAttribute('href');
  
        if(href === '#top'){                       // intro link
          window.scrollTo({top:0, behavior:'smooth'});
          /** ❷  set active manually so it lights up immediately */
          tocLinks.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
          return;
        }
  
        const target = document.getElementById(href.slice(1));
        if(!target) return;
        window.scrollTo({
          top: target.offsetTop - 100,
          behavior:'smooth'
        });
      });
    });
  });
  
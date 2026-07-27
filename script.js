const grid = document.querySelector('.productos-grid');

// Solo activar el scroll/drag de la grilla de productos si existe en esta página
if (grid) {
    // Scroll con rueda del mouse
    grid.addEventListener('wheel', function(e) {
        e.preventDefault();
        grid.scrollLeft += e.deltaY * 1.5;
    }, { passive: false });

    // Arrastrar con el mouse (drag)
    let isDown = false;
    let startX;
    let scrollLeft;

    grid.addEventListener('mousedown', (e) => {
        isDown = true;
        grid.style.cursor = 'grabbing';
        startX = e.pageX - grid.offsetLeft;
        scrollLeft = grid.scrollLeft;
    });

    grid.addEventListener('mouseleave', () => {
        isDown = false;
        grid.style.cursor = 'grab';
    });

    grid.addEventListener('mouseup', () => {
        isDown = false;
        grid.style.cursor = 'grab';
    });

    grid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - grid.offsetLeft;
        const walk = (x - startX) * 1.5;
        grid.scrollLeft = scrollLeft - walk;
    });
}


/* ── STAT COUNTER: animación de contadores en la sección stats ── */
(function() {
    function formatNumber(n, format) {
        if (format === 'short') {
            if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        }
        return n.toLocaleString('es');
    }

    function animateCounter(el, target, prefix, suffix, format) {
        const numEl = el.querySelector('.stat-number');
        if (!numEl) return;

        const duration = 520; // ms — rápido y snappy
        const steps = 28;
        const stepTime = duration / steps;
        let current = 0;
        let frame = 0;

        // ease-out curve: starts fast, decelerates at end
        function easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        clearInterval(el._counter);
        el._counter = setInterval(function() {
            frame++;
            const progress = frame / steps;
            const easedProgress = easeOut(progress);
            current = Math.round(target * easedProgress);

            numEl.textContent = prefix + formatNumber(current, format) + suffix;

            // tiny flash
            numEl.classList.remove('counting');
            void numEl.offsetWidth; // reflow to retrigger
            numEl.classList.add('counting');

            if (frame >= steps) {
                clearInterval(el._counter);
                // Restore original display value
                numEl.textContent = numEl.dataset.original;
                numEl.classList.remove('counting');
            }
        }, stepTime);
    }

    function initStats() {
        var items = document.querySelectorAll('.stat-item');
        items.forEach(function(item) {
            var numEl = item.querySelector('.stat-number');
            if (numEl) numEl.dataset.original = numEl.textContent;

            var target  = parseInt(item.dataset.target, 10);
            var prefix  = item.dataset.prefix  || '';
            var suffix  = item.dataset.suffix  || '';
            var format  = item.dataset.format  || '';

            item.addEventListener('mouseenter', function() {
                animateCounter(item, target, prefix, suffix, format);
            });
            item.addEventListener('mouseleave', function() {
                clearInterval(item._counter);
                var numEl = item.querySelector('.stat-number');
                if (numEl) {
                    numEl.textContent = numEl.dataset.original;
                    numEl.classList.remove('counting');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStats);
    } else {
        initStats();
    }
})();
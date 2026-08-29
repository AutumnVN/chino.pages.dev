(function () {
    var el = document.getElementById('boot-terminal');
    var cmdEl = document.getElementById('boot-cmd');
    if (!el || !cmdEl) {
        root.classList.add('boot-intro-done');
        return;
    }

    var fullCmd = "ssh -i ~/.ssh/id_ed25519 user@kusanagiasami.pages.dev";
    var root = document.documentElement;
    root.classList.add('boot-intro-active');

    function removeCriticalStyle() {
        var c = document.getElementById('boot-terminal-critical');
        if (c) c.remove();
    }

    function finish() {
        el.classList.add('is-exiting');
        el.addEventListener(
            'transitionend',
            function onEnd(ev) {
                if (ev.propertyName !== 'opacity') return;
                el.remove();
                root.classList.remove('boot-intro-active');
                root.classList.add('boot-intro-done');
                removeCriticalStyle();
                if(typeof applyNameAnimation === 'function') applyNameAnimation();
            },
            { once: true }
        );
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cmdEl.textContent = fullCmd;
        setTimeout(finish, 500);
        return;
    }

    var i = 0;
    var delay = 38;

    function tick() {
        if (i >= fullCmd.length) {
            setTimeout(finish, 700);
            return;
        }
        cmdEl.textContent += fullCmd.charAt(i);
        i += 1;
        setTimeout(tick, delay);
    }

    setTimeout(tick, 280);
})();

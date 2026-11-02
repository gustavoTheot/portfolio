/**
 * Neural / Constellation Network Animation
 * Renders an interactive node-and-synapse background on HTML5 Canvas.
 * Automatically dims when the user hovers over readable content cards.
 */
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodes = [];
    const NODE_DENSITY = 14000; // 1 node per X sq pixels
    const MAX_DIST = 135;       // Max distance between nodes to link
    const MOUSE_RADIUS = 185;   // Radius of mouse neural connection

    const mouse = {
        x: -9999,
        y: -9999,
        overContent: false,
        activeAlpha: 0
    };

    const contentSelector = [
        '.terminal-window',
        '.metric-card',
        '.project-card',
        '.exp-card',
        '.toolbox-card',
        '.edu-card',
        '.contact-card',
        'header nav',
        '.btn-primary',
        '.btn-secondary',
        '.social-btn'
    ].join(', ');

    function createNodes() {
        nodes.length = 0;
        const count = Math.min(95, Math.max(40, Math.floor((width * height) / NODE_DENSITY)));

        for (let i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.55,
                vy: (Math.random() - 0.5) * 0.55,
                radius: Math.random() * 1.6 + 1.1,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        createNodes();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.overContent = Boolean(e.target?.closest?.(contentSelector));
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    // Clicking on empty background space spawns new neural nodes
    window.addEventListener('click', (e) => {
        if (mouse.overContent) return;

        for (let i = 0; i < 3; i++) {
            if (nodes.length > 115) nodes.shift();
            nodes.push({
                x: e.clientX + (Math.random() - 0.5) * 20,
                y: e.clientY + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 1.3,
                vy: (Math.random() - 0.5) * 1.3,
                radius: 2.1,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    });

    function renderFrame(timestamp) {
        ctx.clearRect(0, 0, width, height);

        // Smooth fade when hovering over cards vs empty space
        const targetAlpha = mouse.x > 0 && !mouse.overContent ? 1 : 0.18;
        mouse.activeAlpha += (targetAlpha - mouse.activeAlpha) * 0.08;

        // Ambient radial glow around cursor in empty areas
        if (mouse.x > 0 && mouse.activeAlpha > 0.05) {
            const grad = ctx.createRadialGradient(mouse.x, mouse.y, 2, mouse.x, mouse.y, MOUSE_RADIUS * 1.25);
            grad.addColorStop(0, `rgba(56, 189, 248, ${0.11 * mouse.activeAlpha})`);
            grad.addColorStop(0.5, `rgba(2, 132, 199, ${0.04 * mouse.activeAlpha})`);
            grad.addColorStop(1, 'rgba(6, 9, 17, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 1.25, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            const dxMouse = mouse.x - n.x;
            const dyMouse = mouse.y - n.y;
            const distMouse = Math.hypot(dxMouse, dyMouse);

            // Magnetic pull toward cursor in empty space
            if (distMouse < MOUSE_RADIUS && !mouse.overContent) {
                const force = (1 - distMouse / MOUSE_RADIUS) * 0.018;
                n.x += dxMouse * force;
                n.y += dyMouse * force;
            }

            // Draw node
            const pulse = 0.65 + 0.35 * Math.sin(timestamp * 0.0025 + n.pulseOffset);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${0.42 * pulse})`;
            ctx.fill();

            // Connect nearby nodes
            for (let j = i + 1; j < nodes.length; j++) {
                const n2 = nodes[j];
                const dist = Math.hypot(n.x - n2.x, n.y - n2.y);

                if (dist < MAX_DIST) {
                    const alpha = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(n2.x, n2.y);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Connect node to cursor (synapse line)
            if (distMouse < MOUSE_RADIUS && mouse.activeAlpha > 0.05) {
                const lineAlpha = (1 - distMouse / MOUSE_RADIUS) * 0.55 * mouse.activeAlpha;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
                ctx.lineWidth = 1.15;
                ctx.stroke();
            }
        }

        // Central cursor dot when in empty space
        if (mouse.x > 0 && !mouse.overContent) {
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${0.8 * mouse.activeAlpha})`;
            ctx.fill();
        }

        requestAnimationFrame(renderFrame);
    }

    createNodes();
    requestAnimationFrame(renderFrame);
}

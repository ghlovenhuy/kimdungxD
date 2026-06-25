// Cute Girlfriend Website - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE VARIABLES
    let heartCount = parseInt(localStorage.getItem('girlfriend_heart_count') || '0');
    document.getElementById('heart-count').textContent = heartCount;
    
    let isMusicPlaying = false;
    let audioContext = null;
    let melodyTimer = null;
    let currentSlide = 1;
    const totalSlides = 3;

    // 2. CANVAS SPARKLE PARTICLES SYSTEM
    const canvas = document.getElementById('sparkle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor(x, y, isHeart = false, emoji = null) {
            this.x = x;
            this.y = y;
            this.isHeart = isHeart;
            this.emoji = emoji;
            this.size = Math.random() * 8 + 4;
            if (this.emoji) this.size = Math.random() * 15 + 15;
            
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * -3 - 1; // Rise up
            this.gravity = 0.02;
            this.color = `hsl(${Math.random() * 30 + 340}, 100%, ${Math.random() * 20 + 70}%)`; // Pinkish colors
            this.opacity = 1;
            this.fadeSpeed = Math.random() * 0.015 + 0.005;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.1 - 0.05;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity; // Gravity pull down slightly
            this.opacity -= this.fadeSpeed;
            this.angle += this.spin;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            if (this.emoji) {
                ctx.font = `${this.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);
            } else if (this.isHeart) {
                // Draw a heart path
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Simple heart shape
                ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size);
                ctx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
                ctx.fill();
            } else {
                // Draw star/sparkle
                ctx.fillStyle = this.color;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(0, -this.size);
                    ctx.rotate(Math.PI / 5);
                    ctx.lineTo(0, -this.size / 2);
                    ctx.rotate(Math.PI / 5);
                }
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Spawn sparkles on mouse move
    window.addEventListener('mousemove', (e) => {
        if (Math.random() < 0.25) {
            particles.push(new Particle(e.clientX, e.clientY, false));
        }
    });

    // Animate particles
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Occasionally spawn random floating bubbles/sparkles from bottom
        if (Math.random() < 0.03) {
            particles.push(new Particle(Math.random() * canvas.width, canvas.height + 10, true));
        }
        
        // Spawn cute emojis floating
        if (Math.random() < 0.005) {
            const cuteEmojis = ['✨', '💖', '🌸', '💕', '🧸', '🍓', '🎀', '💫'];
            const randomEmoji = cuteEmojis[Math.floor(Math.random() * cuteEmojis.length)];
            particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, false, randomEmoji));
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].opacity <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 3. BACKGROUND MUSIC (Web Audio API Procedural Musicbox)
    // Compose a sweet Lullaby/Music Box loop in C Major (pentatonic chord structure for sweet melody)
    const melodyNotes = [
        { note: 'E5', duration: 0.5 },
        { note: 'G5', duration: 0.5 },
        { note: 'A5', duration: 0.5 },
        { note: 'C6', duration: 1.0 },
        { note: 'B5', duration: 0.5 },
        { note: 'G5', duration: 0.5 },
        { note: 'E5', duration: 0.5 },
        { note: 'D5', duration: 1.0 },
        { note: 'C5', duration: 0.5 },
        { note: 'E5', duration: 0.5 },
        { note: 'G5', duration: 0.5 },
        { note: 'A5', duration: 1.0 },
        { note: 'G5', duration: 0.5 },
        { note: 'E5', duration: 0.5 },
        { note: 'D5', duration: 0.5 },
        { note: 'C5', duration: 1.0 }
    ];

    const noteFreqs = {
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99, 'A5': 880.00,
        'B5': 987.77, 'C6': 1046.50
    };

    function playNote(freq, startTime, duration) {
        if (!audioContext) return;
        
        // Musicbox sound: Sine wave + brief triangle, fast attack, long release decay
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = freq;

        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2; // Octave overtone for musicbox brightness

        // Volume envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.8); // Long bell-like release

        // Connect
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Lowpass filter to make it warmer
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;
        gainNode.connect(filter);
        filter.connect(audioContext.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration * 2.0);
        osc2.stop(startTime + duration * 2.0);
    }

    let noteIndex = 0;
    function playMelodyLoop() {
        if (!isMusicPlaying) return;
        
        const note = melodyNotes[noteIndex];
        const freq = noteFreqs[note.note];
        
        playNote(freq, audioContext.currentTime, note.duration);
        
        noteIndex = (noteIndex + 1) % melodyNotes.length;
        
        // Schedule next note
        const tempoDelay = note.duration * 900; // control tempo speed
        melodyTimer = setTimeout(playMelodyLoop, tempoDelay);
    }

    function toggleMusic() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const musicIcon = document.getElementById('music-icon');
        const wheelLeft = document.getElementById('wheel-left');
        const wheelRight = document.getElementById('wheel-right');

        if (isMusicPlaying) {
            isMusicPlaying = false;
            clearTimeout(melodyTimer);
            musicIcon.className = 'fas fa-play';
            wheelLeft.classList.remove('playing');
            wheelRight.classList.remove('playing');
        } else {
            isMusicPlaying = true;
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            musicIcon.className = 'fas fa-pause';
            wheelLeft.classList.add('playing');
            wheelRight.classList.add('playing');
            noteIndex = 0;
            playMelodyLoop();
        }
    }

    document.getElementById('music-btn').addEventListener('click', toggleMusic);

    // 4. INTERACTIVE ENVELOPE OPENING
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const greetingScreen = document.getElementById('greeting-screen');
    const mainDashboard = document.getElementById('main-dashboard');

    envelopeWrapper.addEventListener('click', () => {
        if (!envelopeWrapper.classList.contains('open')) {
            envelopeWrapper.classList.add('open');
            
            // Pop sound or visual sparkles burst
            for (let i = 0; i < 40; i++) {
                particles.push(new Particle(
                    window.innerWidth / 2 + (Math.random() * 100 - 50),
                    window.innerHeight / 2 - 50 + (Math.random() * 100 - 50),
                    true
                ));
            }

            // Auto-trigger music box
            setTimeout(() => {
                if (!isMusicPlaying) {
                    toggleMusic();
                }
            }, 800);

            // Transition to dashboard after paper rises
            setTimeout(() => {
                greetingScreen.classList.remove('active');
                mainDashboard.classList.add('active');
                
                // Trigger polaroids position initialization
                initializePolaroidMovement();
                
                // Start typing love letter
                setTimeout(startTypewriter, 500);
            }, 1800);
        }
    });

    // 5. TYPEWRITER EFFECT
    const typewriterText = document.getElementById('typewriter-text');
    const letterContent = `Gửi công chúa nhỏ của anh... 👑💖

Anh làm một chiếc website nho nhỏ xinh xinh này để tặng em, hy vọng khi lướt xem em sẽ mỉm cười thật hạnh phúc nha! 😊

Đối với anh, em là cô gái đáng yêu nhất quả đất này. Cảm ơn em đã bước vào cuộc sống của anh và mang theo bao điều ngọt ngào. Cứ mỗi khi nhìn thấy nụ cười của em là anh lại có thêm động lực. 🧸✨

Chúc bé iu của anh luôn vui vẻ, rạng ngời và mãi hạnh phúc nhé! Anh thương em nhiều nhiều! 💕`;

    let charIndex = 0;
    function startTypewriter() {
        if (charIndex < letterContent.length) {
            typewriterText.innerHTML = letterContent.substring(0, charIndex + 1) + '<span class="typing-cursor"></span>';
            charIndex++;
            setTimeout(startTypewriter, 45); // Speed of typewriter typing
        } else {
            // Remove cursor once finished
            typewriterText.innerHTML = letterContent + ' ✨';
        }
    }

    // 6. FLOATING POLAROID CARDS (Floating effect logic)
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    let polaroidsData = [];

    function initializePolaroidMovement() {
        polaroidCards.forEach((card, index) => {
            // Generate randomized initial drifting variables
            const rotation = parseFloat(card.style.getPropertyValue('--rotation')) || 0;
            const topVal = parseFloat(card.style.getPropertyValue('--init-top'));
            const leftVal = parseFloat(card.style.getPropertyValue('--init-left'));
            
            // Map percentage positions to absolute pixels based on parent dashboard dimensions
            const parentWidth = window.innerWidth;
            const parentHeight = window.innerHeight;
            
            let posX = (leftVal / 100) * parentWidth;
            let posY = (topVal / 100) * parentHeight;
            
            polaroidsData.push({
                element: card,
                x: posX,
                y: posY,
                speedX: (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? 1 : -1),
                speedY: (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? 1 : -1),
                rotation: rotation,
                rotSpeed: (Math.random() * 0.05 + 0.02) * (Math.random() < 0.5 ? 1 : -1),
                hovered: false
            });

            // Set up hover states
            card.addEventListener('mouseenter', () => {
                polaroidsData[index].hovered = true;
                // Add sparkles on hover
                for (let k = 0; k < 8; k++) {
                    particles.push(new Particle(polaroidsData[index].x, polaroidsData[index].y, false, '✨'));
                }
            });
            card.addEventListener('mouseleave', () => {
                polaroidsData[index].hovered = false;
            });
            
            // Lightbox triggers
            card.addEventListener('click', () => {
                const img = card.querySelector('img').src;
                const caption = card.querySelector('.polaroid-caption').innerText;
                openLightbox(img, caption);
            });
        });

        // Run animation loop
        requestAnimationFrame(updatePolaroidPositions);
    }

    function updatePolaroidPositions() {
        // Only run drift animation on larger screen widths (desktop/tablet)
        if (window.innerWidth > 900) {
            polaroidsData.forEach((p) => {
                if (!p.hovered) {
                    p.x += p.speedX;
                    p.y += p.speedY;
                    p.rotation += p.rotSpeed;

                    // Bound checks and bounce
                    const cardWidth = 190;
                    const cardHeight = 240;

                    if (p.x < cardWidth/2 || p.x > window.innerWidth - cardWidth/2) {
                        p.speedX *= -1;
                        p.rotSpeed *= -1;
                    }
                    if (p.y < cardHeight/2 + 60 || p.y > window.innerHeight - cardHeight/2 - 20) {
                        p.speedY *= -1;
                        p.rotSpeed *= -1;
                    }

                    // Constrain rotation between -15 and 15 degrees
                    if (p.rotation > 15 || p.rotation < -15) {
                        p.rotSpeed *= -1;
                    }

                    // Apply styles
                    p.element.style.left = `${p.x}px`;
                    p.element.style.top = `${p.y}px`;
                    p.element.style.setProperty('--rotation', `${p.rotation}deg`);
                }
            });
        }
        requestAnimationFrame(updatePolaroidPositions);
    }

    // 7. LIGHTBOX CONTROLS
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src, captionText) {
        lightboxImg.src = src;
        lightboxCap.innerText = captionText;
        lightbox.classList.add('active');
    }

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxClose) {
            lightbox.classList.remove('active');
        }
    });

    // 8. INFINITY LOVE BUTTON CLICKER
    const loveButton = document.getElementById('love-button');
    loveButton.addEventListener('click', (e) => {
        heartCount++;
        localStorage.setItem('girlfriend_heart_count', heartCount);
        document.getElementById('heart-count').textContent = heartCount;
        
        // Spawn lots of hearts jumping from the button
        const btnRect = loveButton.getBoundingClientRect();
        const centerX = btnRect.left + btnRect.width / 2;
        const centerY = btnRect.top + btnRect.height / 2;
        
        const loveEmojis = ['💖', '❤️', '💕', '💝', '💘', '🌸', '😘', '🧸'];
        for (let i = 0; i < 15; i++) {
            const randomEmoji = loveEmojis[Math.floor(Math.random() * loveEmojis.length)];
            const p = new Particle(centerX, centerY, true, randomEmoji);
            p.speedX = Math.random() * 6 - 3;
            p.speedY = Math.random() * -6 - 2; // Jump up higher
            particles.push(p);
        }

        // Add bounce click effect to button
        loveButton.style.transform = 'scale(0.85)';
        setTimeout(() => {
            loveButton.style.transform = 'scale(1)';
        }, 100);
    });

    // 9. CAROUSEL MEMORY SLIDER
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    function showSlide(slideNum) {
        // Hide all slides
        document.querySelectorAll('.carousel-slide').forEach(slide => {
            slide.classList.remove('active');
        });
        // Deactivate all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show active slide and dot
        document.getElementById(`slide-${slideNum}`).classList.add('active');
        document.querySelector(`.dot[data-slide="${slideNum}"]`).classList.add('active');
        currentSlide = slideNum;
    }

    prevBtn.addEventListener('click', () => {
        let prev = currentSlide - 1;
        if (prev < 1) prev = totalSlides;
        showSlide(prev);
    });

    nextBtn.addEventListener('click', () => {
        let next = currentSlide + 1;
        if (next > totalSlides) next = 1;
        showSlide(next);
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideNum = parseInt(dot.getAttribute('data-slide'));
            showSlide(slideNum);
        });
    });

    // 10. INTERACTIVE QUIZ REACTIONS
    const quizOptions = document.querySelectorAll('.quiz-opt-btn');
    const quizReply = document.getElementById('quiz-reply');

    const responses = {
        happy: "Aww, thấy bé iu vui vẻ anh cũng hạnh phúc lây luôn nè! Hãy cười thật tươi mỗi ngày nhé, nụ cười của em là điều đẹp nhất đời anh! 🥰💖",
        tired: "Thương em nhiều lắm... Ngoan nào, anh gửi cho em một cái ôm cực to và ấm áp đây! 🧸 Mọi mệt mỏi sẽ nhanh chóng trôi qua thôi, tối anh đưa đi ăn ngon nhé! 🥺💕",
        miss: "Anh cũng nhớ bé iu da diết luôn nè! Cứ muốn bay ngay tới cạnh để ôm em thật chặt và thơm em 1000 cái thôi. Gửi ngàn nụ hôn ngọt ngào đến công chúa nha! 😘💋"
    };

    quizOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const reaction = btn.getAttribute('data-reaction');
            quizReply.style.opacity = 0;
            
            setTimeout(() => {
                quizReply.innerText = responses[reaction];
                quizReply.style.opacity = 1;
                
                // Burst custom emojis on quiz selection
                const rect = btn.getBoundingClientRect();
                const burstEmoji = reaction === 'happy' ? '🥰' : reaction === 'tired' ? '🧸' : '😘';
                for (let i = 0; i < 8; i++) {
                    const p = new Particle(rect.left + rect.width/2, rect.top + rect.height/2, false, burstEmoji);
                    p.speedX = Math.random() * 4 - 2;
                    p.speedY = Math.random() * -4 - 1;
                    particles.push(p);
                }
            }, 200);
        });
    });
});

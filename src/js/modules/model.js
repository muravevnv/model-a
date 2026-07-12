document.addEventListener('DOMContentLoaded', () => {
    (function () {
        const holder = document.getElementById('canvas-holder');
        const sceneWrap = document.getElementById('scene-wrap');

        let initialized = false;

        // --- Динамическая подгрузка three.js по требованию ---
        function loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // --- Вся 3D-логика запускается только один раз, после подгрузки библиотеки ---
        function initScene() {
            // --- Сцена, камера, рендерер ---
            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(45, holder.clientWidth / holder.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 6);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(holder.clientWidth, holder.clientHeight);
            holder.appendChild(renderer.domElement);

            // --- Свет ---
            const ambient = new THREE.AmbientLight(0xffffff, 0.55);
            scene.add(ambient);

            const keyLight = new THREE.DirectionalLight(0xffffff, 1);
            keyLight.position.set(4, 5, 6);
            scene.add(keyLight);

            const rimLight = new THREE.DirectionalLight(0x8899ff, 0.6);
            rimLight.position.set(-5, -2, -4);
            scene.add(rimLight);

            // --- Фигура: куб (можно заменить на сферу или .glb-модель, см. ниже) ---
            const geometry = new THREE.BoxGeometry(2.4, 2.4, 2.4, 4, 4, 4);
            const material = new THREE.MeshStandardMaterial({
                color: 0x4f6df5,
                metalness: 0.25,
                roughness: 0.35,
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            const edges = new THREE.EdgesGeometry(geometry);
            const edgeLines = new THREE.LineSegments(
                edges,
                new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
            );
            mesh.add(edgeLines);

            /* ЕСЛИ НУЖНА СФЕРА ВМЕСТО КУБА — закомментируйте блок BoxGeometry выше
               и раскомментируйте это:
        
            const geometry = new THREE.SphereGeometry(1.6, 48, 48);
            const material = new THREE.MeshStandardMaterial({
              color: 0x4f6df5,
              metalness: 0.3,
              roughness: 0.4,
            });
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            */

            // --- Вращение вокруг вертикальной оси (влево / вправо), 360° без ограничений ---
            let currentRotationY = 0;
            let dragVelocity = 0;
            let isDragging = false;
            let lastPointerX = 0;

            function onPointerDown(x) {
                isDragging = true;
                lastPointerX = x;
                dragVelocity = 0;
            }

            function onPointerMove(x) {
                if (!isDragging) return;
                const deltaX = x - lastPointerX;
                lastPointerX = x;

                const rotationSpeed = 0.008;
                const delta = deltaX * rotationSpeed;

                currentRotationY += delta;
                dragVelocity = delta;
            }

            function onPointerUp() {
                isDragging = false;
            }

            holder.addEventListener('mousedown', (e) => onPointerDown(e.clientX));
            window.addEventListener('mousemove', (e) => onPointerMove(e.clientX));
            window.addEventListener('mouseup', onPointerUp);

            holder.addEventListener('touchstart', (e) => onPointerDown(e.touches[0].clientX), { passive: true });
            window.addEventListener('touchmove', (e) => onPointerMove(e.touches[0].clientX), { passive: true });
            window.addEventListener('touchend', onPointerUp);

            function animate() {
                requestAnimationFrame(animate);

                if (!isDragging) {
                    dragVelocity *= 0.95;
                    currentRotationY += dragVelocity;
                }

                mesh.rotation.y = currentRotationY;
                renderer.render(scene, camera);
            }
            animate();

            function handleResize() {
                const w = holder.clientWidth;
                const h = holder.clientHeight;
                if (w === 0 || h === 0) return;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }

            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(handleResize);
                resizeObserver.observe(holder);
            } else {
                window.addEventListener('resize', handleResize);
            }
        }

        // --- Наблюдатель: инициализируем сцену, только когда секция реально видна ---
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !initialized) {
                        initialized = true;
                        observer.disconnect(); // больше не нужен — сцена запускается один раз

                        loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js')
                            .then(initScene)
                            .catch(() => {
                                console.error('Не удалось загрузить three.js');
                            });
                    }
                });
            },
            {
                root: null,
                rootMargin: '200px', // начинаем подгрузку чуть заранее, до полного появления секции
                threshold: 0.01,
            }
        );

        observer.observe(sceneWrap);
    })();
})
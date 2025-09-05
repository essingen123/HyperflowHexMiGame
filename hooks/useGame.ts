import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { GameSettings, GameState } from '../types';
import { STANCES, HEX_R, CATCH_Z, SPAWN_Z, SCROLL_BASE } from '../constants';

interface UseGameProps {
  mountRef: React.RefObject<HTMLDivElement>;
  settings: GameSettings;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  scoreRef: React.RefObject<HTMLDivElement>;
  comboRef: React.RefObject<HTMLDivElement>;
}

export const useGame = ({ mountRef, settings, setGameState, scoreRef, comboRef }: UseGameProps) => {
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Core Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 0, 40);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.6, 0.6, 0.0);
    composer.addPass(bloomPass);

    const clock = new THREE.Clock();

    // Game world groups
    const world = new THREE.Group();
    const tunnelGroup = new THREE.Group();
    const shellGroup = new THREE.Group();
    const railsGroup = new THREE.Group();
    const paddlesGroup = new THREE.Group();
    
    tunnelGroup.add(shellGroup, railsGroup);
    world.add(tunnelGroup, paddlesGroup); // Paddles are separate from tunnel rotation
    scene.add(world);

    // --- Game Objects ---
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R, HEX_R, Math.abs(SPAWN_Z) * 2.2, 6, 1, true));
    const shellMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true });
    shell.material = shellMat;
    shellGroup.add(shell);

    const railGeom = new THREE.BoxGeometry(1.05, 1.05, Math.abs(SPAWN_Z) * 2.2);
    const railBars: { bar: THREE.Mesh; glow: THREE.Mesh }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const barMat = new THREE.MeshBasicMaterial();
      const glowMat = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true });
      const bar = new THREE.Mesh(railGeom, barMat);
      const glow = new THREE.Mesh(railGeom, glowMat);
      [bar, glow].forEach(m => { m.position.set(HEX_R * Math.cos(a), HEX_R * Math.sin(a), 0); m.rotation.z = a + Math.PI / 2; });
      railsGroup.add(bar, glow);
      railBars.push({ bar, glow });
    }

    const paddleGeom = new THREE.BoxGeometry(1, 1, 1);
    const paddleMat = new THREE.MeshBasicMaterial();
    const paddleL = new THREE.Mesh(paddleGeom, paddleMat);
    const paddleR = new THREE.Mesh(paddleGeom, paddleMat.clone());
    paddlesGroup.add(paddleL, paddleR);

    const streaks = new THREE.Group();
    const sGeom = new THREE.BoxGeometry(0.16, 0.16, 6);
    const sMat = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true });
    for (let i = 0; i < 1000; i++) {
        const m = new THREE.Mesh(sGeom, sMat.clone());
        streaks.add(m);
    }
    tunnelGroup.add(streaks);

    const wallPool: THREE.Mesh[] = [];
    const wallGeom = new THREE.BoxGeometry(HEX_R * Math.tan(Math.PI / 6) * 1.05, 1.5, 3);
    const wallMat = new THREE.MeshBasicMaterial({ transparent: true });
    for (let i = 0; i < 6 * 10; i++) {
      const m = new THREE.Mesh(wallGeom, wallMat.clone());
      m.visible = false; m.userData = {};
      tunnelGroup.add(m);
      wallPool.push(m);
    }
    
    const particlePool: THREE.Mesh[] = [];
    const particleGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const particleMat = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true });
    for (let i = 0; i < 200; i++) {
      const p = new THREE.Mesh(particleGeom, particleMat.clone());
      p.visible = false; p.userData = {};
      world.add(p);
      particlePool.push(p);
    }
    
    // --- Game State & Logic ---
    let localGameState: GameState & { speed: number; shake: number };
    const pattern = [1, 1, 1, 1, 0, 1, 2, 1, 0, 1, 2, 2, 1, 1, 0, 1];
    let pIdx = 0; let spawnTimer = 0;
    
    const AC = new (window.AudioContext || (window as any).webkitAudioContext)();
    function blip(kind: 'hit' | 'miss') {
        if (AC.state === 'suspended') return;
        const t = AC.currentTime; const o = AC.createOscillator(), g = AC.createGain();
        o.connect(g).connect(AC.destination);
        if (kind === 'hit') { o.type = 'sawtooth'; o.frequency.setValueAtTime(480,t); o.frequency.exponentialRampToValueAtTime(240,t+0.10); g.gain.setValueAtTime(0.25,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.10); }
        else if (kind === 'miss') { o.type = 'square'; o.frequency.setValueAtTime(120,t); g.gain.setValueAtTime(0.22,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.22); }
        o.start(t); o.stop(t+0.24);
    }
    
    const setGliders = (immediate = false) => {
      const s = STANCES[localGameState.stance];
      const lerp = immediate ? 1 : 0.2;
      [paddleL, paddleR].forEach((car, i) => {
          const targetAngle = i === 0 ? s.lA : s.rA;
          let angle = car.userData.angle || targetAngle;
          if (Math.abs(targetAngle - angle) > Math.PI) angle += (targetAngle > angle ? 2 * Math.PI : -2 * Math.PI);
          car.userData.angle = THREE.MathUtils.lerp(angle, targetAngle, lerp);
          const radius = settingsRef.current.paddles.radius;
          car.position.set(radius * Math.cos(car.userData.angle), radius * Math.sin(car.userData.angle), CATCH_Z);
          const bank = settingsRef.current.paddles.bankAngle * (i === 0 ? 1 : -1) * Math.sign(Math.cos(angle)); // Simple banking
          car.rotation.set(0, 0, car.userData.angle + Math.PI/2 + bank);
      });
    }

    const spawn = () => {
        const sIdx = pattern[pIdx]; pIdx = (pIdx + 1) % pattern.length;
        const s = STANCES[sIdx];
        const openTracks = s.tracks;

        for (let i = 0; i < 6; i++) {
            if (openTracks.includes(i)) continue;
            const w = wallPool.find(wall => !wall.visible);
            if (!w) continue;

            w.visible = true;
            w.userData.stance = sIdx;
            w.userData.checked = false;
            
            const angle = i * Math.PI / 3;
            w.position.set(HEX_R * Math.cos(angle), HEX_R * Math.sin(angle), SPAWN_Z);
            w.rotation.z = angle;
        }
    };
    
    const triggerParticles = (pos: THREE.Vector3, color: THREE.Color) => {
        let count = settingsRef.current.particles.count;
        particlePool.forEach(p => {
            if (!p.visible && count > 0) {
                p.visible = true;
                (p.material as THREE.MeshBasicMaterial).color.set(color);
                p.position.copy(pos);
                p.userData = { 
                    vel: new THREE.Vector3((Math.random()-0.5)*40, (Math.random()-0.5)*40, (Math.random()-0.5)*40), 
                    life: Math.random() * 0.8 + 0.2 
                };
                count--;
            }
        });
    }

    const reset = () => {
        localGameState = { speed: settingsRef.current.game.speed, stance: 1, score: 0, combo: 0, shake: 0, over: false };
        setGameState({ score: 0, combo: 0, stance: 1, over: false });
        wallPool.forEach(c => c.visible = false);
        particlePool.forEach(p => p.visible = false);
        pIdx = 0; spawnTimer = 0;
        setGliders(true);
        for (let i = 0; i < 12; i++) {
            spawn();
            wallPool.forEach(c => { if (c.visible) c.position.z += i * -160; });
        }
    };
    
    // --- Animation Loop ---
    let animationFrameId: number;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const dt = Math.min(clock.getDelta(), 0.05);
        const s = settingsRef.current;

        // Update materials and settings
        bloomPass.enabled = s.bloom.enabled;
        bloomPass.strength = s.bloom.strength;
        bloomPass.radius = s.bloom.radius;
        bloomPass.threshold = s.bloom.threshold;

        shell.visible = s.shell.enabled;
        shellMat.wireframe = s.shell.wireframe;
        shellMat.color.set(s.shell.color);
        shellMat.opacity = s.shell.opacity;

        railBars.forEach(rb => {
          rb.bar.visible = s.rails.enabled;
          rb.glow.visible = s.rails.enabled;
          (rb.bar.material as THREE.MeshBasicMaterial).color.set(s.rails.baseColor);
          (rb.glow.material as THREE.MeshBasicMaterial).color.set(s.rails.glowColor);
          (rb.glow.material as THREE.MeshBasicMaterial).opacity = 0.4;
        });

        paddleL.scale.set(s.paddles.width, s.paddles.height, s.paddles.depth);
        paddleR.scale.set(s.paddles.width, s.paddles.height, s.paddles.depth);
        const currentStanceColor = STANCES[localGameState.stance]?.color || 0xffffff;
        (paddleL.material as THREE.MeshBasicMaterial).color.lerpColors(new THREE.Color(s.paddles.color), new THREE.Color(currentStanceColor), 0.5);
        (paddleR.material as THREE.MeshBasicMaterial).color.copy((paddleL.material as THREE.MeshBasicMaterial).color);

        streaks.children.forEach((streak, i) => {
            streak.visible = s.streaks.enabled && i < s.streaks.count;
        });
        (sMat.color as THREE.Color).set(s.streaks.color);
        sMat.opacity = s.streaks.opacity;

        wallMat.wireframe = s.walls.wireframe;
        wallMat.opacity = s.walls.opacity;
        
        world.rotation.set(THREE.MathUtils.degToRad(s.rotation.x), THREE.MathUtils.degToRad(s.rotation.y), THREE.MathUtils.degToRad(s.rotation.z));
        shellGroup.rotation.set(THREE.MathUtils.degToRad(s.shell.rotation.x), THREE.MathUtils.degToRad(s.shell.rotation.y), THREE.MathUtils.degToRad(s.shell.rotation.z));
        railsGroup.rotation.set(THREE.MathUtils.degToRad(s.rails.rotation.x), THREE.MathUtils.degToRad(s.rails.rotation.y), THREE.MathUtils.degToRad(s.rails.rotation.z));
        paddlesGroup.rotation.set(THREE.MathUtils.degToRad(s.paddles.rotation.x), THREE.MathUtils.degToRad(s.paddles.rotation.y), THREE.MathUtils.degToRad(s.paddles.rotation.z));

        // Game logic
        if (!localGameState.over) {
            tunnelGroup.rotation.z += dt * s.game.tunnelRotationSpeed;

            streaks.children.forEach(str => {
                if(!str.visible) return;
                str.position.z += dt * SCROLL_BASE * localGameState.speed * 0.55;
                if (str.position.z > CATCH_Z) {
                    const t = Math.random() * Math.PI * 2;
                    const r = HEX_R * 0.94 + Math.random() * 2.2;
                    str.position.set(r * Math.cos(t), r * Math.sin(t), SPAWN_Z - Math.random() * 200);
                }
            });

            setGliders();

            const scroll = dt * SCROLL_BASE * localGameState.speed;
            wallPool.forEach(w => {
                if (!w.visible) return;
                w.position.z += scroll;
                if (!w.userData.checked && w.position.z > CATCH_Z - 8 && w.position.z < CATCH_Z + 8) {
                    w.userData.checked = true;
                    if (w.userData.stance === localGameState.stance) {
                        localGameState.combo++;
                        localGameState.score += 10 + localGameState.combo;
                        localGameState.speed += 0.005;
                        localGameState.shake = 0.35;
                        setGameState(st => ({ ...st, score: localGameState.score, combo: localGameState.combo }));
                        scoreRef.current?.classList.add('pop');
                        comboRef.current?.classList.add('pop');
                        setTimeout(() => {
                            scoreRef.current?.classList.remove('pop');
                            comboRef.current?.classList.remove('pop');
                        }, 90);
                        blip('hit');
                        if (s.particles.enabled) {
                            triggerParticles(paddleL.position, (w.material as THREE.MeshBasicMaterial).color);
                            triggerParticles(paddleR.position, (w.material as THREE.MeshBasicMaterial).color);
                        }
                    } else {
                        blip('miss');
                        localGameState.over = true;
                        setGameState(st => ({ ...st, over: true }));
                    }
                }
                if (w.position.z > 60) w.visible = false;
            });
            
            spawnTimer += dt;
            if (spawnTimer > s.game.spawnFrequency && wallPool.filter(c => c.visible).length < 28) {
                spawnTimer = 0;
                spawn();
            }

            if (localGameState.shake > 0) {
                world.position.set((Math.random() - 0.5) * localGameState.shake, (Math.random() - 0.5) * localGameState.shake, 0);
                localGameState.shake -= dt * 3;
            } else {
                world.position.lerp(new THREE.Vector3(0, 0, 0), 0.15);
            }
        }
        
        particlePool.forEach(p => {
            if (!p.visible) return;
            p.position.addScaledVector(p.userData.vel, dt);
            p.userData.life -= dt;
            (p.material as THREE.MeshBasicMaterial).opacity = p.userData.life / 1.0;
            if (p.userData.life <= 0) p.visible = false;
        });

        composer.render();
    };

    // --- Event Listeners ---
    const handleKeyDown = (e: KeyboardEvent) => {
        if (AC.state === 'suspended') AC.resume();
        if (localGameState.over) {
            reset();
            return;
        }
        let newStance = localGameState.stance;
        if (e.key === 'ArrowUp') newStance = (localGameState.stance + 2) % 3;
        if (e.key === 'ArrowDown') newStance = (localGameState.stance + 1) % 3;
        if (newStance !== localGameState.stance) {
            localGameState.stance = newStance;
            setGameState(st => ({ ...st, stance: newStance }));
        }
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    reset();
    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      // Dispose of Three.js objects
      scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();
              if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
              } else {
                  object.material.dispose();
              }
          }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [mountRef]); // Re-run effect only if mount point changes
};

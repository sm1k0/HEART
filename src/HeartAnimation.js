import React, { useEffect, useRef } from 'react';

const HeartAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
    );
    const koef = mobile ? 0.5 : 1;

    const resizeCanvas = () => {
      canvas.width = koef * window.innerWidth;
      canvas.height = koef * window.innerHeight;
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const rand = Math.random;
    const heartPosition = (rad) => [
      Math.pow(Math.sin(rad), 3),
      -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad)),
    ];

    const scaleAndTranslate = (pos, sx, sy, dx, dy) => [
      dx + pos[0] * sx,
      dy + pos[1] * sy,
    ];

    const traceCount = mobile ? 20 : 50;
    const pointsOrigin = [];
    const dr = mobile ? 0.3 : 0.1;

    for (let i = 0; i < Math.PI * 2; i += dr) {
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
      pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    }

    const targetPoints = [];
    const pulse = (kx, ky) => {
      pointsOrigin.forEach((point, i) => {
        targetPoints[i] = [
          kx * point[0] + canvas.width / 2,
          ky * point[1] + canvas.height / 2,
        ];
      });
    };

    const e = pointsOrigin.map((_, i) => {
      const x = rand() * canvas.width;
      const y = rand() * canvas.height;
      const trace = Array.from({ length: traceCount }, () => ({ x, y }));

      return {
        vx: 0,
        vy: 0,
        R: 2,
        speed: rand() + 5,
        q: ~~(rand() * pointsOrigin.length),
        D: 2 * (i % 2) - 1,
        force: 0.2 * rand() + 0.7,
        f: `hsla(0,${~~(40 * rand() + 60)}%,${~~(60 * rand() + 20)}%,.3)`,
        trace,
      };
    });

    const config = {
      traceK: 0.4,
      timeDelta: 0.01,
    };

    let time = 0;
    const loop = () => {
      const n = -Math.cos(time);
      pulse((1 + n) * 0.5, (1 + n) * 0.5);
      time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      e.forEach((particle) => {
        const q = targetPoints[particle.q];
        const dx = particle.trace[0].x - q[0];
        const dy = particle.trace[0].y - q[1];
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 10) {
          if (rand() > 0.95) {
            particle.q = ~~(rand() * pointsOrigin.length);
          } else if (rand() > 0.99) {
            particle.D *= -1;
          } else {
            particle.q += particle.D;
            particle.q %= pointsOrigin.length;
            if (particle.q < 0) particle.q += pointsOrigin.length;
          }
        }

        particle.vx += (-dx / length) * particle.speed;
        particle.vy += (-dy / length) * particle.speed;
        particle.trace[0].x += particle.vx;
        particle.trace[0].y += particle.vy;
        particle.vx *= particle.force;
        particle.vy *= particle.force;

        for (let k = 0; k < particle.trace.length - 1; k++) {
          const T = particle.trace[k];
          const N = particle.trace[k + 1];
          N.x -= config.traceK * (N.x - T.x);
          N.y -= config.traceK * (N.y - T.y);
        }

        ctx.fillStyle = particle.f;
        particle.trace.forEach((point) => {
          ctx.fillRect(point.x, point.y, 1, 1);
        });
      });

      window.requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

export default HeartAnimation;

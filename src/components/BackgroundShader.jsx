"use client";

import { useEffect, useRef } from "react";

export default function BackgroundShader({ themeColors }) {
  const canvasRef = useRef(null);
  const themeColorsRef = useRef(themeColors);

  // Keep themeColors ref updated so the animation loop can read it without recreating WebGL context
  useEffect(() => {
    themeColorsRef.current = themeColors;
  }, [themeColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;

      void main() {
          vec2 uv = v_texCoord;
          vec2 p = (uv - 0.5) * 2.0;
          p.x *= u_resolution.x / u_resolution.y;

          float t = u_time * 0.2;
          
          // Create multiple layers of moving noise-like gradients
          float noise1 = sin(p.x * 2.0 + t) * cos(p.y * 2.5 - t * 0.5);
          float noise2 = cos(p.x * 1.5 - t * 0.8) * sin(p.y * 2.0 + t * 0.3);
          
          vec3 mixedColor = mix(u_color1, u_color2, noise1 * 0.5 + 0.5);
          mixedColor = mix(mixedColor, u_color3, noise2 * 0.5 + 0.5);
          
          // Add subtle vignetting
          float dist = length(p);
          mixedColor *= 1.0 - dist * 0.4;
          
          // Add dynamic "stars" or glints
          float stars = pow(fract(sin(dot(uv.xy ,vec2(12.9898,78.233))) * 43758.5453), 20.0);
          mixedColor += stars * 0.15 * (sin(u_time + uv.x * 10.0) * 0.5 + 0.5);

          gl_FragColor = vec4(mixedColor, 1.0);
      }
    `;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const compiledVs = compileShader(gl.VERTEX_SHADER, vs);
    const compiledFs = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!compiledVs || !compiledFs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, compiledVs);
    gl.attachShader(prog, compiledFs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uColor1 = gl.getUniformLocation(prog, "u_color1");
    const uColor2 = gl.getUniformLocation(prog, "u_color2");
    const uColor3 = gl.getUniformLocation(prog, "u_color3");

    let animationFrameId;

    function render(t) {
      if (!canvas || !gl) return;
      if (!resizeObserver) syncSize();
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);

      // Read current colors or fall back to Plum/Purple/Teal theme
      const colors = themeColorsRef.current || {
        color1: [0.04, 0.02, 0.08],
        color2: [0.18, 0.03, 0.32],
        color3: [0.04, 0.12, 0.22]
      };

      if (uColor1) gl.uniform3fv(uColor1, new Float32Array(colors.color1));
      if (uColor2) gl.uniform3fv(uColor2, new Float32Array(colors.color2));
      if (uColor3) gl.uniform3fv(uColor3, new Float32Array(colors.color3));

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-60">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

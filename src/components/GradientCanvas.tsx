import React, { useEffect, useRef } from 'react';

interface GradientCanvasProps {
  colors: string[];
  scale: number;
  warp: number;
  bendX: number;
  bendY: number;
  complexity: number;
  grain: number;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    : [0, 0, 0];
};

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform vec3 u_color4;
  
  uniform float u_scale;
  uniform float u_warp;
  uniform float u_bendX;
  uniform float u_bendY;
  uniform float u_complexity;
  uniform float u_grain;

  // Simplex 2D noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ) );
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
  }

  // Better hash function for analog film grain
  float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
  }

  float generateGrain(vec2 fragCoord, float intensity) {
      // Mix two frequencies for a clumpy, organic film grain look
      float n1 = hash(fragCoord);
      float n2 = hash(floor(fragCoord * 0.5)); // clumped
      float noise = mix(n1, n2, 0.4);
      return (noise - 0.5) * intensity * 2.0;
  }

  void main() {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
      // Aspect ratio correction for noise
      vec2 p = uv;
      p.x *= u_resolution.x / u_resolution.y;
      
      // Apply bend (biegen)
      p.x += sin(p.y * 3.14) * u_bendX;
      p.y += sin(p.x * 3.14) * u_bendY;
      
      // Apply scale
      p *= u_scale;

      // Create a sweeping warp using noise
      float w1 = snoise(p + vec2(0.0, 0.0));
      float w2 = snoise(p + vec2(5.2, 1.3));
      
      vec2 warped = p + vec2(w1, w2) * u_warp;
      
      // Base gradient value (diagonal sweep from bottom-left to top-right)
      float val = (uv.x + uv.y) * 0.5; 
      
      // Add the warped noise to create organic folds
      val += snoise(warped * u_complexity) * 0.3 * u_warp;
      
      // Map the value to our 4 colors
      vec3 c = mix(u_color1, u_color2, smoothstep(0.1, 0.4, val));
      c = mix(c, u_color3, smoothstep(0.4, 0.7, val));
      c = mix(c, u_color4, smoothstep(0.7, 1.0, val));

      // Add monochromatic grain
      float grain = generateGrain(gl_FragCoord.xy, u_grain);
      c += grain;

      gl_FragColor = vec4(c, 1.0);
  }
`;

export default function GradientCanvas({
  colors,
  scale,
  warp,
  bendX,
  bendY,
  complexity,
  grain,
}: GradientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const locationsRef = useRef<any>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    locationsRef.current = {
      position: gl.getAttribLocation(program, 'a_position'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      color1: gl.getUniformLocation(program, 'u_color1'),
      color2: gl.getUniformLocation(program, 'u_color2'),
      color3: gl.getUniformLocation(program, 'u_color3'),
      color4: gl.getUniformLocation(program, 'u_color4'),
      scale: gl.getUniformLocation(program, 'u_scale'),
      warp: gl.getUniformLocation(program, 'u_warp'),
      bendX: gl.getUniformLocation(program, 'u_bendX'),
      bendY: gl.getUniformLocation(program, 'u_bendY'),
      complexity: gl.getUniformLocation(program, 'u_complexity'),
      grain: gl.getUniformLocation(program, 'u_grain'),
    };

    // We don't auto-resize to window anymore, we resize to the canvas element's actual size
    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        // Match internal resolution to display size
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth;
          canvas.height = displayHeight;
          gl.viewport(0, 0, canvas.width, canvas.height);
          render();
        }
      }
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      gl.deleteProgram(program);
    };
  }, []);

  const render = () => {
    const gl = glRef.current;
    const program = programRef.current;
    const locs = locationsRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !canvas) return;

    gl.useProgram(program);

    gl.enableVertexAttribArray(locs.position);
    gl.vertexAttribPointer(locs.position, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(locs.resolution, canvas.width, canvas.height);
    
    const c1 = hexToRgb(colors[0]);
    const c2 = hexToRgb(colors[1]);
    const c3 = hexToRgb(colors[2]);
    const c4 = hexToRgb(colors[3]);
    
    gl.uniform3f(locs.color1, c1[0], c1[1], c1[2]);
    gl.uniform3f(locs.color2, c2[0], c2[1], c2[2]);
    gl.uniform3f(locs.color3, c3[0], c3[1], c3[2]);
    gl.uniform3f(locs.color4, c4[0], c4[1], c4[2]);
    
    gl.uniform1f(locs.scale, scale);
    gl.uniform1f(locs.warp, warp);
    gl.uniform1f(locs.bendX, bendX);
    gl.uniform1f(locs.bendY, bendY);
    gl.uniform1f(locs.complexity, complexity);
    gl.uniform1f(locs.grain, grain);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  useEffect(() => {
    render();
  }, [colors, scale, warp, bendX, bendY, complexity, grain]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
}

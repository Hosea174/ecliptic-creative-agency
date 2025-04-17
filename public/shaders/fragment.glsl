uniform float u_red;
  uniform float u_green;
  uniform float u_blue;
  uniform float u_emissiveStrength; // Added for glow control

  void main() {
    // Calculate base color
    vec3 baseColor = vec3(u_red, u_green, u_blue);

    // Add emissive glow based on a uniform value
    vec3 glow = vec3(u_emissiveStrength);

    gl_FragColor = vec4(baseColor + glow, 1.0);
  }
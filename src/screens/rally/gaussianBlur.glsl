precision mediump float;

uniform sampler2D u_Texture;  // Textura de entrada
uniform float u_Sigma;        // Valor de Sigma para el desenfoque
uniform vec2 u_Resolution;    // Resolución de la textura

void main() {
    vec2 texCoord = gl_FragCoord.xy / u_Resolution;

    float weightSum = 0.0;
    vec4 blurColor = vec4(0.0);

    // Definir el kernel para el desenfoque
    const int kernelSize = 9;
    float kernel[kernelSize];
    vec2 offsets[kernelSize];

    // Inicializamos los valores del kernel y los desplazamientos
    for (int i = 0; i < kernelSize; i++) {
        float x = float(i) - float(kernelSize / 2);
        kernel[i] = exp(-(x * x) / (2.0 * u_Sigma * u_Sigma));
        offsets[i] = vec2(x / u_Resolution.x, 0.0);
        weightSum += kernel[i];
    }

    // Aplicamos el desenfoque horizontal
    for (int i = 0; i < kernelSize; i++) {
        blurColor += texture2D(u_Texture, texCoord + offsets[i]) * kernel[i];
    }

    blurColor /= weightSum;

    gl_FragColor = blurColor;
}

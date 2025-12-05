// Imagens locais adicionadas na raiz do projeto (Vite irá empacotar ao importar)
// Observação: os nomes possuem acentos e espaços, suportados pelo Vite.
// Caso prefira, podemos mover para /public e referenciar por caminho absoluto.
import imgPaiMuTan from '../../Chá Branco Pai Mu Tan.jpg';
import imgCamomila from '../../Chá de Camomila.jpg';
import imgHibisco from '../../Chá de Hibisco.jpg';
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&auto=format&fit=crop&q=80"
];

const DEFAULT_PRODUCT_IMAGE = FALLBACK_IMAGES[0];

const NAMED_IMAGES: Record<string, string> = {
  "pai mu tan": imgPaiMuTan,
  "camomila": imgCamomila,
  "hibisco": imgHibisco,
};

const pickFallbackImage = (productName: string): string => {
  if (FALLBACK_IMAGES.length === 0) {
    return "";
  }

  if (!productName) {
    return FALLBACK_IMAGES[0];
  }

  const hash = [...productName].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[index];
};

export const resolveProductImage = (productName: string, image?: string | null): string => {
  const sanitized = typeof image === "string" ? image.trim() : "";
  const name = (productName || "").toLowerCase();
  // 1) Prioriza imagem nomeada específica
  for (const key of Object.keys(NAMED_IMAGES)) {
    if (name.includes(key)) {
      return NAMED_IMAGES[key];
    }
  }
  // 2) Se não houver mapeamento, usa a imagem fornecida (quando existir)
  if (sanitized) return sanitized;
  // 3) Caso contrário, escolhe um fallback consistente
  return pickFallbackImage(productName) || DEFAULT_PRODUCT_IMAGE;
};

export const getFallbackImageForProduct = (productName: string): string => {
  return pickFallbackImage(productName) || DEFAULT_PRODUCT_IMAGE;
};

import { createClient } from "@supabase/supabase-js";

// Usar variables de entorno para las credenciales
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las credenciales estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener la URL pública de un video
export async function getVideoUrl(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    if (error) {
      return null;
    }

    return data.publicUrl;
  } catch (error) {
    return null;
  }
}

// Función para obtener URLs de todos los videos
export async function getAllVideos() {
  try {
    const { data, error } = await supabase.storage.from("videos").list();

    if (error) {
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Ordenar los videos por nombre (video1, video2, etc.)
    const sortedData = [...data].sort((a, b) => {
      // Extraer números de los nombres de archivo (video1.mp4 -> 1)
      const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    // Obtener las URLs públicas de forma asíncrona
    const videoPromises = sortedData.map(async (file) => {
      const { data: urlData } = await supabase.storage
        .from("videos")
        .getPublicUrl(file.name);

      return {
        name: file.name,
        url: urlData.publicUrl,
      };
    });

    // Esperar a que todas las promesas se resuelvan
    return await Promise.all(videoPromises);
  } catch (error) {
    return [];
  }
}

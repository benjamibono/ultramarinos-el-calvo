import { createClient } from "@supabase/supabase-js";

// Usar variables de entorno para las credenciales
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las credenciales estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: Credenciales de Supabase no definidas");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para obtener la URL pública de un video
export async function getVideoUrl(fileName) {
  try {
    const { data, error } = await supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    if (error) {
      console.error("Error al obtener URL del video:", error);
      return null;
    }

    return data.publicUrl;
  } catch (error) {
    console.error("Error inesperado al obtener URL del video:", error);
    return null;
  }
}

// Función para obtener URLs de todos los videos
export async function getAllVideos() {
  try {
    console.log("Obteniendo lista de videos...");
    const { data, error } = await supabase.storage.from("videos").list();

    if (error) {
      console.error("Error al obtener la lista de videos:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No se encontraron videos en el bucket");
      return [];
    }

    console.log(`Se encontraron ${data.length} videos`);

    // Ordenar los videos por nombre (video1, video2, etc.)
    const sortedData = [...data].sort((a, b) => {
      // Extraer números de los nombres de archivo (video1.mp4 -> 1)
      const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
      const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
      return numA - numB;
    });

    console.log(
      "Videos ordenados:",
      sortedData.map((file) => file.name).join(", ")
    );

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
    console.error("Error inesperado al obtener videos:", error);
    return [];
  }
}

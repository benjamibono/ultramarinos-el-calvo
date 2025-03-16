// Script para probar la conexión con Supabase y el acceso al bucket de videos
import { createClient } from "@supabase/supabase-js";

// Usar las mismas credenciales que en el archivo .env.local
const supabaseUrl = "https://bcbhixlflcrtaguuzzkm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYmhpeGxmbGNydGFndXV6emttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjc5ODMsImV4cCI6MjA1NzcwMzk4M30.4864wS3SPxgp5lq0udNdQHwgyOWFaXpKwViRgrBH6Rw";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log("Probando conexión con Supabase...");

  try {
    // Probar la conexión básica
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("Error al listar buckets:", bucketsError);
      return;
    }

    console.log("Buckets disponibles:", buckets.map((b) => b.name).join(", "));

    // Verificar si existe el bucket "videos"
    const videoBucket = buckets.find((b) => b.name === "videos");
    if (!videoBucket) {
      console.error("Error: No se encontró el bucket 'videos'");
      console.log(
        "Debes crear un bucket llamado 'videos' en tu proyecto de Supabase"
      );
      return;
    }

    // Listar archivos en el bucket "videos"
    const { data: files, error: filesError } = await supabase.storage
      .from("videos")
      .list();

    if (filesError) {
      console.error(
        "Error al listar archivos en el bucket 'videos':",
        filesError
      );
      console.log(
        "Verifica que las políticas de acceso permitan listar archivos"
      );
      return;
    }

    if (!files || files.length === 0) {
      console.log("No hay archivos en el bucket 'videos'");
      console.log(
        "Debes subir videos al bucket para que aparezcan en la aplicación"
      );
      return;
    }

    console.log(
      `Se encontraron ${files.length} archivos en el bucket 'videos':`
    );
    files.forEach((file) => console.log(`- ${file.name}`));

    // Probar obtener URL pública de un archivo
    const firstFile = files[0];
    const { data: urlData, error: urlError } = await supabase.storage
      .from("videos")
      .getPublicUrl(firstFile.name);

    if (urlError) {
      console.error("Error al obtener URL pública:", urlError);
      console.log(
        "Verifica que las políticas de acceso permitan obtener URLs públicas"
      );
      return;
    }

    console.log(`URL pública para ${firstFile.name}:`, urlData.publicUrl);
    console.log("Prueba de acceso a la URL:");

    // Verificar si la URL es accesible
    try {
      const response = await fetch(urlData.publicUrl, { method: "HEAD" });
      console.log(`Respuesta HTTP: ${response.status} ${response.statusText}`);

      if (response.ok) {
        console.log("✅ La URL es accesible públicamente");
      } else {
        console.log("❌ La URL no es accesible públicamente");
        console.log("Verifica las políticas de acceso del bucket");
      }
    } catch (fetchError) {
      console.error("Error al acceder a la URL:", fetchError);
    }
  } catch (error) {
    console.error("Error inesperado:", error);
  }
}

testSupabaseConnection();

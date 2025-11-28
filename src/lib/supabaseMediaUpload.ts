import { supabase } from "./supabase";

export default async function supabaseMediaUpload(
  file: any
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("media")
    .upload(`media/${file.name}`, file.data, {
      contentType: file.mimetype,
      upsert: true,
    });

  // console.log(data);

  if (error) {
    console.log(error);
    return null;
  }

  // return public url
  const urlData = supabase.storage
    .from("media")
    .getPublicUrl(`media/${file.name}`); // path inside the bucket

  // console.log(urlData.data);

  return urlData.data?.publicUrl ?? null;
}

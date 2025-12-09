import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const POST = async (req: NextRequest) => {
  try {
    const { image_base64, filename, owner, timestamp, pgn } = await req.json();

    if (!image_base64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const buffer = Buffer.from(image_base64, "base64");
    const fileName = `${Date.now()}-${filename || "upload"}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("upload-images")
      .upload(`uploads/${fileName}`, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("upload-images")
      .getPublicUrl(uploadData.path);
    const publicUrl = publicData.publicUrl;

    await updateDoc(doc(db, "users", owner), {
      images: arrayUnion(publicUrl),
      pgns: arrayUnion(pgn),
      dates_uploaded: arrayUnion(timestamp),
    });

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
};

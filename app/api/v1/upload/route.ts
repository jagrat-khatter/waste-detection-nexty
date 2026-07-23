// Responsibility: Handle image uploads, reverse geocoding, and ML waste detection.
import { NextResponse, type NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { prisma } from "@/lib/prisma";

const ML_API_URL = "https://jagrat-khatter-waste-detection-api.hf.space/api/v1/predict";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let file: File | null = null;
    let buffer: Buffer | null = null;
    let lat: string | null = null;
    let lon: string | null = null;
    let userEmail: string | null = null;

    // 1. Determine Content-Type and Parse
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      file = formData.get("image") as File | null;

      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          if (key === "latitude" || key === "lat") lat = value;
          if (key === "longitude" || key === "lon") lon = value;
          if (key === "userEmail" || key === "email") userEmail = value;

          if (value.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(value);
              if (parsed.latitude) lat = parsed.latitude.toString();
              if (parsed.longitude) lon = parsed.longitude.toString();
              if (parsed.userEmail) userEmail = parsed.userEmail.toString();
            } catch {
              // Ignore invalid JSON strings
            }
          }
        }
      }
    } else if (contentType.includes("application/json")) {
      const json = await request.json();
      lat = json.latitude?.toString() || null;
      lon = json.longitude?.toString() || null;
      userEmail = json.userEmail?.toString() || null;
      
      // We can't handle files in raw JSON, only base64 or URLs. 
      // If the user meant to send a file, they MUST use multipart/form-data.
      return NextResponse.json({ 
        error: "Cannot process image via application/json", 
        message: "You must send the request as 'multipart/form-data' to upload a file. Please remove the 'Content-Type: application/json' header." 
      }, { status: 400 });

    } else {
      return NextResponse.json({ error: "Invalid Content-Type. Please use multipart/form-data." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    // 2. Upload image to Cloudinary
    buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "civicx_uploads", resource_type: "auto" },
        (error, result) => {
          if (error || !result) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const imageUrl = uploadResult.secure_url;
    const publicId = uploadResult.public_id;

    // 3. Call ML Prediction API
    const predictRes = await fetch(ML_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    
    if (!predictRes.ok) {
       throw new Error(`ML API returned ${predictRes.status}`);
    }
    const predictData = await predictRes.json();
    const detectedCount = predictData.detected_items_count ?? 0;
    const detectedItems = predictData.detected_items ?? [];

    // 4. Cleanup if no waste detected
    if (detectedCount === 0 || detectedItems.length === 0) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
      return NextResponse.json({
        status: "no_waste_detected",
        message: "No waste detected. Image removed from storage.",
        detected_items_count: 0,
        detected_items: []
      });
    }

    // 5. Reverse Geocoding
    let sector = null;
    let address = null;
    let display_name = null;

    if (lat && lon) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
          { headers: { "User-Agent": "CivicX-App/1.0" } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          display_name = geoData.display_name || null;
          address = geoData.address || null;
          
          if (display_name) {
            const match = display_name.match(/Sector\s+\d+[A-Za-z]?/i);
            if (match) sector = match[0];
          }
          if (!sector && address) {
            sector = address.suburb || address.neighbourhood || address.city_district || null;
          }
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      }
    }

    // 6. Save to Database
    await prisma.wasteReport.create({
      data: {
        id: imageUrl,
        userEmail: userEmail || "anonymous",
        imageUrl: imageUrl,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lon ? parseFloat(lon) : null,
        address: sector,
        detectedItemsCount: detectedCount,
        detectedItems: {
          create: detectedItems.map((item: any) => ({
            label: item.label,
            confidence: item.confidence,
            xMin: item.xMin,
            yMin: item.yMin,
            xMax: item.xMax,
            yMax: item.yMax,
          }))
        }
      }
    });

    // 7. Return Final Response
    return NextResponse.json({
      status: "success",
      image_url: imageUrl,
      detected_items_count: detectedCount,
    });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 });
  }
}

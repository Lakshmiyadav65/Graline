"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";

interface MultipleImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function MultipleImageUpload({ urls, onChange }: MultipleImageUploadProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.show("Please log in to upload images.", "error");
      return;
    }

    setUploading(true);
    const newUrls = [...urls];

    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${session.user.id}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("listing-images").getPublicUrl(fileName);
        if (data?.publicUrl) {
          newUrls.push(data.publicUrl);
        }
      }

      onChange(newUrls);
      toast.show("Images uploaded successfully", "success");
    } catch (err: any) {
      toast.show(err.message || "Failed to upload images", "error");
    } finally {
      setUploading(false);
      e.target.value = ""; // clear input
    }
  }

  function handleRemove(indexToRemove: number) {
    const newUrls = urls.filter((_, idx) => idx !== indexToRemove);
    onChange(newUrls);
  }

  return (
    <div className="space-y-4">
      <label className="block text-[11px] tracking-[0.15em] uppercase text-muted mb-1 font-semibold">
        Rice Photos (Multiple Images)
      </label>

      {/* Uploaded Images Grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {urls.map((url, idx) => (
            <div key={idx} className="relative aspect-square border border-line rounded-card overflow-hidden bg-cream group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Listing photo ${idx + 1}`} className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 p-1 bg-terra text-white rounded-full text-[12px] opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                title="Remove photo"
              >
                ✕
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-paddy text-cream text-[9px] uppercase tracking-wider font-semibold rounded-[2px]">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File input trigger */}
      <div>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-line rounded-card bg-paper text-[13px] font-semibold uppercase tracking-wider text-ink-soft cursor-pointer hover:border-ink hover:text-ink transition-colors disabled:opacity-50">
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Uploading...
            </span>
          ) : (
            "Add Photos"
          )}
        </label>
        <p className="text-[11px] text-muted mt-1.5">You can upload multiple JPG/PNG images of your rice.</p>
      </div>
    </div>
  );
}

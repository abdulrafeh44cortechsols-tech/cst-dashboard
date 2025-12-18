"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Italic,
  Essentials,
  Paragraph,
  Heading,
  List,
  BlockQuote,
  Alignment,
  ImageUpload,
  ImageBlock,
  ImageResize,
  ImageInsert,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
} from "ckeditor5";
import { toast } from "sonner";
import { mediaService } from "@/services/media";
import "ckeditor5/ckeditor5.css";
import "./ckeditor-custom.css";
import { Plugin, ButtonView } from "ckeditor5";
import { useState } from "react";
import { MediaGalleryModal } from "../media/MediaGalleryModal";
import { getImageUrl } from "@/lib/utils";

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
}

// Custom upload adapter for CKEditor to use our media API
class MediaUploadAdapter {
  loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload() {
    try {
      const file = await this.loader.file;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select a valid image file");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB");
      }

      // Upload to media API
      const uploadedMedia = await mediaService.uploadMedia({
        image: file,
        alt_text: "", // No alt text needed as per user's request
      });

      toast.success("Image uploaded successfully!");

      return {
        default: uploadedMedia.image, // URL of uploaded image
      };
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(
        "Failed to upload image: " + (error.message || "Unknown error")
      );
      throw error;
    }
  }

  abort() {
    // Handle upload abort if needed
  }
}

// Custom media gallery button plugin
class MediaGalleryButtonPlugin extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("mediaGallery", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: "Select from Gallery",
        withText: true,
        tooltip: "Insert image from media gallery",
      });

      button.on("execute", () => {
        editor.fire("openMediaGallery");
      });

      return button;
    });
  }
}

// Plugin to add custom upload adapter
function MediaUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    return new MediaUploadAdapter(loader);
  };
}

export default function CKEditorWrapper({
  value,
  onChange,
}: CKEditorWrapperProps) {
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  const insertImageIntoEditor = (imageUrl: string, altText = "") => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const imageElement = writer.createElement("imageBlock", {
        src: imageUrl,
        alt: altText,
      });

      editorInstance.model.insertContent(
        imageElement,
        editorInstance.model.document.selection
      );
    });
  };

  return (
    <div className="ckeditor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        onReady={(editor) => {
          setEditorInstance(editor);

          editor.on("openMediaGallery", () => {
            setShowMediaGallery(true);
          });
        }}
        config={{
          licenseKey: "GPL", // Use GPL for free open-source usage
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            List,
            BlockQuote,
            Alignment,
            ImageUpload,
            ImageBlock,
            ImageResize,
            ImageInsert,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            MediaGalleryButtonPlugin,
          ],
          toolbar: [
            "heading",
            "|",
            "bold",
            "italic",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "alignment:left",
            "alignment:center",
            "alignment:right",
            "alignment:justify",
            "|",
            "blockQuote",
            "|",
            "insertImage",
            "mediaGallery",
          ],
          heading: {
            options: [
              {
                model: "paragraph",
                title: "Paragraph",
                class: "ck-heading_paragraph",
              },
              {
                model: "heading1",
                view: "h1",
                title: "Heading 1",
                class: "ck-heading_heading1",
              },
              {
                model: "heading2",
                view: "h2",
                title: "Heading 2",
                class: "ck-heading_heading2",
              },
              {
                model: "heading3",
                view: "h3",
                title: "Heading 3",
                class: "ck-heading_heading3",
              },
              {
                model: "heading4",
                view: "h4",
                title: "Heading 4",
                class: "ck-heading_heading4",
              },
              {
                model: "heading5",
                view: "h5",
                title: "Heading 5",
                class: "ck-heading_heading5",
              },
              {
                model: "heading6",
                view: "h6",
                title: "Heading 6",
                class: "ck-heading_heading6",
              },
            ],
          },
          alignment: {
            options: ["left", "center", "right", "justify"],
          },
          image: {
            toolbar: [
              "imageStyle:inline",
              "imageStyle:block",
              "|",
              "resizeImage",
            ],
            resizeOptions: [
              {
                name: "resizeImage:original",
                label: "Original",
                value: null,
              },
              {
                name: "resizeImage:50",
                label: "50%",
                value: "50",
              },
              {
                name: "resizeImage:75",
                label: "75%",
                value: "75",
              },
            ],
          },
          extraPlugins: [MediaUploadAdapterPlugin],
          placeholder: "Write something awesome...",
        }}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
      <MediaGalleryModal
        open={showMediaGallery}
        onOpenChange={setShowMediaGallery}
        maxSelection={1}
        minSelection={1}
        title="Insert Image from Media"
        onSelect={(media) => {
          if (media.length > 0) {
            const selected = media[0];
            insertImageIntoEditor(
              getImageUrl(selected.image),
              selected.alt_text || ""
            );
          }
        }}
      />
    </div>
  );
}

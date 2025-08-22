"use client";
import React, { useState } from "react";
import { Send, Save } from "lucide-react";
import { Button } from "../ui/button";

const QuickDraft: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving draft:", { title, content });
  };

  const handlePublish = () => {
    // Handle publish logic here
    console.log("Publishing:", { title, content });
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div className="flex space-x-3 justify-end w-full">
        <Button onClick={handleSave} variant={"blue"}>
          <Save className="w-4 h-4" />
          <span>Save Draft</span>
        </Button>
        <Button onClick={handlePublish} variant={"blue"}>
          <Send className="w-4 h-4" />
          <span>Publish</span>
        </Button>
      </div>
    </div>
  );
};

export default QuickDraft;

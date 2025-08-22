export interface Editor {
  id: string
  name: string
  email: string
  role: "Editor"
}

export interface CreateEditorData {
  name: string
  email: string
  role: Editor["role"]
}
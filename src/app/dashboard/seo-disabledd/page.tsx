import React from 'react'
import { AdminOnlyRoute } from "@/components/RouteGuard";

const page = () => {
  return (
    <AdminOnlyRoute>
      <div>Seo management</div>
    </AdminOnlyRoute>
  )
}

export default page
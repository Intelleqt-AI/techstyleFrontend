"use client"

export function exportToCSV<T extends Record<string, any>>(filename: string, rows: T[]) {
  if (!rows || rows.length === 0) {
    // still create an empty CSV with just filename
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    link.click()
    URL.revokeObjectURL(url)
    return
  }
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    const str = String(val ?? "")
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ]
  const csvContent = lines.join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  link.click()
  URL.revokeObjectURL(url)
}

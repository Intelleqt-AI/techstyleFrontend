import { LibraryNav } from "@/components/library-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function MaterialsPage() {
  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <LibraryNav />

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🧱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Materials Library</h3>
            <p className="text-gray-600 mb-6">Coming soon - manage your material samples and specifications</p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Shield, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export default function ComplianceNotice() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-xl shadow-lg border border-amber-200 p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-amber-800">合规提示</h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-amber-700 mt-1">
            本工具仅供教师教学教研使用，不收集任何学生/家长信息，严格遵守双减政策。
          </p>
        </div>
      </div>
    </div>
  )
}

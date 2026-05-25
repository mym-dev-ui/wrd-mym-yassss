"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, CreditCard, Globe } from "lucide-react"
import { 
  getSettings, 
  addBlockedCardBin, 
  removeBlockedCardBin, 
  addAllowedCountry, 
  removeAllowedCountry,
  type Settings 
} from "@/lib/firebase/settings"
import { toast } from "sonner"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

// List of countries with flags
const COUNTRIES = [
  { code: "SAU", name: "السعودية", flag: "🇸🇦" },
  { code: "ARE", name: "الإمارات", flag: "🇦🇪" },
  { code: "KWT", name: "الكويت", flag: "🇰🇼" },
  { code: "BHR", name: "البحرين", flag: "🇧🇭" },
  { code: "OMN", name: "عمان", flag: "🇴🇲" },
  { code: "QAT", name: "قطر", flag: "🇶🇦" },
  { code: "JOR", name: "الأردن", flag: "🇯🇴" },
  { code: "EGY", name: "مصر", flag: "🇪🇬" },
  { code: "LBN", name: "لبنان", flag: "🇱🇧" },
  { code: "IRQ", name: "العراق", flag: "🇮🇶" },
  { code: "SYR", name: "سوريا", flag: "🇸🇾" },
  { code: "YEM", name: "اليمن", flag: "🇾🇪" },
  { code: "PSE", name: "فلسطين", flag: "🇵🇸" },
  { code: "MAR", name: "المغرب", flag: "🇲🇦" },
  { code: "DZA", name: "الجزائر", flag: "🇩🇿" },
  { code: "TUN", name: "تونس", flag: "🇹🇳" },
  { code: "LBY", name: "ليبيا", flag: "🇱🇾" },
  { code: "SDN", name: "السودان", flag: "🇸🇩" },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    blockedCardBins: [],
    allowedCountries: []
  })
  const [newBinsInput, setNewBinsInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"cards" | "countries">("cards")

async function loadSettings() {
  try {
    const data = await getSettings()
    setSettings(data)
  } catch (error) {
    console.error("Error loading settings:", error)
    toast.error("فشل تحميل الإعدادات")
  }
}

useEffect(() => {
  if (!isOpen) return

  const run = async () => {
    await loadSettings()
  }

  run()
}, [isOpen])

  const handleAddBins = async () => {
    // Split by comma, space, or newline
    const bins = newBinsInput
      .split(/[\s,\n]+/)
      .map(bin => bin.trim())
      .filter(bin => bin.length === 4 && /^\d+$/.test(bin))

    if (bins.length === 0) {
      toast.error("يجب إدخال أرقام صحيحة (4 أرقام لكل بطاقة)")
      return
    }

    setLoading(true)
    try {
      for (const bin of bins) {
        await addBlockedCardBin(bin)
      }
      await loadSettings()
      setNewBinsInput("")
      toast.success(`تم إضافة ${bins.length} بطاقة محظورة`)
    } catch (error) {
      console.error("Error adding blocked BINs:", error)
      toast.error("فشل إضافة البطاقات")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBin = async (bin: string) => {
    setLoading(true)
    try {
      await removeBlockedCardBin(bin)
      await loadSettings()
      toast.success("تم إزالة البطاقة المحظورة")
    } catch (error) {
      console.error("Error removing blocked BIN:", error)
      toast.error("فشل إزالة البطاقة")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCountry = async () => {
    if (!selectedCountry) {
      toast.error("يرجى اختيار دولة")
      return
    }

    setLoading(true)
    try {
      await addAllowedCountry(selectedCountry)
      await loadSettings()
      setSelectedCountry("")
      toast.success("تم إضافة الدولة المسموحة")
    } catch (error) {
      console.error("Error adding allowed country:", error)
      toast.error("فشل إضافة الدولة")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCountry = async (country: string) => {
    setLoading(true)
    try {
      await removeAllowedCountry(country)
      await loadSettings()
      toast.success("تم إزالة الدولة المسموحة")
    } catch (error) {
      console.error("Error removing allowed country:", error)
      toast.error("فشل إزالة الدولة")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">⚙️ إعدادات النظام</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "cards"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>حجب بطاقات الدفع</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === "countries"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-5 h-5" />
              <span>تقييد الوصول حسب الدولة</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "cards" ? (
            <div className="space-y-6">
              {/* Title and Description */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">قائمة حجب بطاقات الدفع</h3>
                <p className="text-sm text-gray-600">
                  أضف البيانات الخاصة بأرقام البطاقات التي لا تريده. يمكنك إضافة مجموعة من البيانات
                  <br />
                  مفصولة بفاصلة أو فاصلة أو سطر جديد. اضغط Enter لإضافة كل بلوك.
                </p>
              </div>

              {/* Multi-line Input */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <textarea
                  value={newBinsInput}
                  onChange={(e) => setNewBinsInput(e.target.value)}
                  placeholder="مثال: 4890, 4458, 4909&#10;أو كل رقم في سطر منفصل"
                  rows={4}
                  dir="ltr"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-mono resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={handleAddBins}
                    disabled={loading || !newBinsInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setNewBinsInput("")}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>

              {/* Blocked BINs List as Badges */}
              <div>
                {settings.blockedCardBins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>لا توجد بطاقات محظورة</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.blockedCardBins.map((bin) => (
                      <div
                        key={bin}
                        className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2"
                      >
                        <span className="font-mono text-sm font-semibold text-gray-700">
                          {bin}
                        </span>
                        <button
                          onClick={() => handleRemoveBin(bin)}
                          disabled={loading}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title and Description */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">تقييد الوصول حسب الدولة</h3>
                <p className="text-sm text-gray-600">
                  تحكم في الدول التي تسمح لها بالوصول إلى موقعك الإلكتروني للتعزيز الأمان.
                  <br />
                  يمكنك إضافة أكثر من دولة. وسيمنع الوصول من أي دولة غير موجودة في القائمة.
                </p>
              </div>

              {/* Country Dropdown */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  - الدول المسموح لها بالوصول -
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-base"
                    dir="rtl"
                  >
                    <option value="">اختر دولة...</option>
                    {COUNTRIES.filter(c => !settings.allowedCountries.includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddCountry}
                    disabled={loading || !selectedCountry}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    حفظ
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  يمكنك إضافة أكثر من دولة غير موجودة في القائمة.
                </p>
              </div>

              {/* Allowed Countries List as Badges */}
              <div>
                {settings.allowedCountries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Globe className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>جميع الدول مسموحة (لم يتم تحديد قيود)</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedCountries.map((countryCode) => {
                      const country = COUNTRIES.find(c => c.code === countryCode)
                      return (
                        <div
                          key={countryCode}
                          className="bg-green-50 border border-green-300 rounded-full px-4 py-2 flex items-center gap-2"
                        >
                          <span className="text-lg">{country?.flag || "🌍"}</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {country?.name || countryCode}
                          </span>
                          <button
                            onClick={() => handleRemoveCountry(countryCode)}
                            disabled={loading}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
